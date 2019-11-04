const mongoose = require('mongoose')
const User = require('./user')

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A product must have a name'],
            minlength: [
                50,
                'A product name must have more or equal than 50 characters'
            ]
        },
        price: {
            type: Number,
            required: [true, 'A product must have a price']
        },
        oldPrice: {
            type: Number,
            default: null
        },
        image: {
            type: String,
            required: [true, 'A product must have a image']
        },
        images: {
            type: Array,
            default: null
        },
        seller: Object,
        review: {
            type: Array,
            default: null
        },
        description: {
            type: String,
            default: null
        },
        specifications: {
            type: Object,
            default: null
        },
        quantity: {
            type: Number,
            default: 1
        },
        category: {
            type: String,
            required: [true, 'A product category is required']
        },
        brand: {
            type: String,
            default: null
        },
        createdAtMill: {
            type: Number,
            default: Date.now()
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

// productSchema.virtual('createAt').get(function() {
//     return new Date(this.createdAtMill).toISOString()
// })

productSchema.pre('save', async function(next) {
    this.seller = await User.findById(this.seller).select('-__v')
    next()
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product
