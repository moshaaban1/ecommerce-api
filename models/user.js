const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is empty'],
        minlength: [10, 'Name must be at least 10 characters']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email address']
    },
    photo: {
        type: String
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'seller', 'user'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Password is empty'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Password confirmation is required'],
        validate: {
            validator: function() {
                if (this.password !== this.passwordConfirm)
                    this.invalidate(
                        'passwordConfirm',
                        'Password must match confirmation'
                    )
                return true
            }
        }
    },
    changePasswordAt: {
        type: Date,
        select: false
    },
    passwordRestToken: {
        type: String,
        select: false
    },
    passwordRestExpires: {
        type: String,
        select: false
    }
})

// Document middleware: runs only before save(), create()
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined

    return next()
})

// Query middleware: runs only before any method starts with find()
userSchema.pre(/^find/, async function(next) {
    this.find({ active: { $ne: false } })
    next()
})

userSchema.statics.checkPassword = async function(userPassword, realPass) {
    const compareResult = await bcrypt.compare(userPassword, realPass)
    return compareResult
}

userSchema.methods.createPasswordRestToken = function() {
    const randomToken = crypto.randomBytes(32).toString('hex')

    this.passwordRestToken = crypto
        .createHash('sha256')
        .update(randomToken)
        .digest('hex')

    this.passwordRestExpires = Date.now() + 10 * 60 * 1000

    return randomToken
}

const User = mongoose.model('User', userSchema)

module.exports = User
