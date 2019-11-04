const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync')

exports.getProductReview = catchAsync(async (req, res, next) => {
    const reviews = await Review.find()
    console.log(req.params.productId)

    res.status(200).json({
        status: 'success',
        result: reviews.length,
        data: {
            reviews
        }
    })
})

exports.addReview = catchAsync(async (req, res, next) => {
    req.body.user = res.user.id
    if (!req.params.productId) req.body.product = req.params.productId

    const review = await Review.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    })
})
