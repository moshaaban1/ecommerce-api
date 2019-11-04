const express = require('express')
const router = express.Router({ mergeParams: true })
const reviewControllers = require('../controllers/review')
const authControllers = require('../controllers/auth')

router
    .route('/')
    .get(reviewControllers.getProductReview)
    .post(
        authControllers.isAuth,
        authControllers.roles('user'),
        reviewControllers.addReview
    )

module.exports = router
