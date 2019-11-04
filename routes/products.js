const express = require('express')
const router = express.Router()

const productControllers = require('../controllers/products')
const authControllers = require('../controllers/auth')
const reviewRoutes = require('../routes/review')

// Review Routes
router.use('/:productId/reviews', reviewRoutes)

router
    .route('/')
    // .get(productControllers.aliasTopProducts, productControllers.getAllProducts)
    .get(productControllers.getAllProducts)
    .post(
        authControllers.isAuth,
        authControllers.roles('seller', 'admin'),
        productControllers.addProduct
    )

router.get('/categoriesAndBrands', productControllers.getCategoriesAndBrands)

router.get(
    '/top-products',
    productControllers.aliasTopProducts,
    productControllers.getAllProducts
)

router.get('/products-stats', productControllers.getProductStats)

router
    .route('/:productId')
    .get(productControllers.getProduct)
    .delete(
        authControllers.isAuth,
        authControllers.roles('seller', 'admin'),
        productControllers.deleteProduct
    )
    .put(
        authControllers.isAuth,
        authControllers.roles('seller', 'admin'),
        productControllers.updateProduct
    )

module.exports = router
