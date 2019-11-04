const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!']
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            max: [5, 'Rating must be between 1.0 and 5.0'],
            min: 1
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must be belong to a user']
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: [true, 'Review must be belong to a Product']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name'
    }).populate({
        path: 'product',
        select: 'name'
    })
    next()
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
