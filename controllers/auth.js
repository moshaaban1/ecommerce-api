const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const AppError = require('../utils/apiError')
const catchAsync = require('../utils/catchAsync')
const sendEmail = require('../utils/email')

const signToken = (id, res) => {
    const token = jwt.sign({ id }, process.env.SECRET)
    const cookieOption = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') cookieOption.secure = true

    res.cookie('token', token, cookieOption)

    return token
}

exports.login = catchAsync(async (req, res, next) => {
    // CHECK USER DATA
    if (!req.body.email) {
        return next(new AppError('Please provide a valid email address', 400))
    }
    if (!req.body.password) {
        return next(new AppError('Please provide a valid password', 400))
    }

    // FIND USER EMAIL
    const user = await User.findOne({ email: req.body.email }).select(
        '+password'
    )

    // IF EMAIL NOTFOUND
    if (!user) {
        return next(new AppError('This Email is not exist', 404))
    }

    // IF THE EMAIL IS EXIST CHECK IF PASSWORD CORRECT OR NOT
    const checkPassword = await User.checkPassword(
        req.body.password,
        user.password
    )
    if (!checkPassword) {
        return next(new AppError('Password is incorrect', 400))
    }

    // IF EVERYTHING OKAY, GENERATE A TOKEN
    const token = signToken(user.id, res)

    user.password = undefined
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
})

exports.register = catchAsync(async (req, res, next) => {
    const user = await User.create(req.body)
    const token = signToken(user.id, res)

    user.password = undefined
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
})

exports.forgetPassword = catchAsync(async (req, res, next) => {
    // Get user email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new AppError('There is no user with email address', 404))
    }

    // Generate random rest token
    const restToken = user.createPasswordRestToken()
    await user.save({ validateBeforeSave: false })

    // Send it to user's email
    const restURL = `${req.protocol}://${req.get('host')}${
        req.originalUrl
    }/${restToken}`
    const message = `Forget your password? Submit a PATCH request with your new password and password confirm 
    to: ${restURL}.\nIf you didn't forget your password, please ignore this message!`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password rest token just valid for 10 minutes',
            message
        })

        res.status(200).json({
            status: 'success',
            message:
                'Please check your email inbox for a link to reset your password'
        })
    } catch (err) {
        user.passwordRestToken = undefined
        user.passwordRestExpires = undefined
        await user.save()

        return next(
            new AppError(
                'There was an error sending the email. Try again later!'
            )
        )
    }

    // If there is no internet use this function for test
    // res.status(200).json({
    //     status: 'success',
    //     message: 'Please check your email inbox for a link to reset your password',
    //     restToken
    // })
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // Get user based on the token
    const hashToken = crypto
        .createHash('sha256')
        .update(req.params.restToken)
        .digest('hex')

    const user = await User.findOne({
        passwordRestToken: hashToken,
        passwordRestExpires: { $gt: Date.now() }
    })

    // If token is still valid, and if there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordRestToken = undefined
    user.passwordRestExpires = undefined
    await user.save()

    // Update changePasswordAt property for the user
    user.changePasswordAt = new Date()
    await user.save({ validateBeforeSave: false })

    // Log the user in, send a new JWT
    const token = signToken(user.id, res)

    user.password = undefined
    user.changePasswordAt = undefined
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // Get user from IsAuth middleware
    const user = res.user

    // Check if user's current password is correct
    const checkPassword = await User.checkPassword(
        req.body.password,
        user.password
    )
    if (!checkPassword) {
        return next(new AppError('Password is incorrect', 400))
    }

    // If everything okay, update password
    user.password = req.body.newPassword
    user.passwordConfirm = req.body.newPasswordConfirm
    await user.save()

    // Log user in, send JWT
    const token = signToken(user.id, res)
    user.password = undefined

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
})

exports.isAuth = async (req, res, next) => {
    var token
    if (req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.token) {
        token = req.cookies.token.split(' ')[1]
    } else {
        return next(new AppError('Please login to continue', 401))
    }
    const verify = jwt.verify(token, process.env.SECRET, function(err, token) {
        if (err) {
            return next(
                new AppError('Invalid request token. please login again', 401)
            )
        }
        return token
    })

    // CHECK IF USER STILL EXIST
    const user = await User.findById(verify.id).select('+password')

    if (!user) {
        return next(
            new AppError('User is no longer exists. please login again', 401)
        )
    }

    // CHECK IF PASSWORD HAS BEEN CHANGED AFTER TOKEN ISSUED
    if (user.changePasswordAt) {
        const getTime = Math.floor(user.changePasswordAt.getTime() / 1000)
        if (verify.iat < getTime) {
            return next(
                new AppError('Expired request token. please login again', 401)
            )
        }
    }

    res.user = user
    return next()
}

exports.roles = (...roles) => (req, res, next) => {
    const currentUserRole = res.user.role
    if (roles.includes(currentUserRole)) {
        return next()
    }
    return next(new AppError('Access denied', 400))
}
