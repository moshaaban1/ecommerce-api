const Product = require('../models/product')
const ApiFeatures = require('../utils/apiFeatures')

const AppError = require('../utils/apiError')
const catchAsync = require('../utils/catchAsync')

exports.aliasTopProducts = (req, res, next) => {
    req.query.limit = 5
    req.query.sort = '-rating,price'
    req.query.fields = 'name,price,rating,image,_id'
    next()
}

exports.getAllProducts = catchAsync(async (req, res, next) => {
    const resultLength = await Product.countDocuments()
    const products = await new ApiFeatures(req.query, Product)
        .filter()
        .sort()
        .fields()
        .page()

    res.status(200).json({
        status: 'success',
        result: resultLength,
        limit: products.length,
        data: {
            products
        }
    })
})

exports.addProduct = catchAsync(async (req, res, next) => {
    req.body.seller = res.user.id

    const product = await Product.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            product
        }
    })
})

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.productId)

    if (!product) {
        return next(new AppError('No product found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    })
})

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.productId)

    if (!product) {
        return next(new AppError('No product found with that ID', 404))
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.updateProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(
        req.params.productId,
        req.body
    )

    if (!product) {
        return next(new AppError('No product found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    })
})

exports.getCategoriesAndBrands = async (req, res, next) => {
    const category = await Product.find().distinct('category')
    const brand = await Product.find().distinct('brand')

    res.status(200).json({
        status: 'success',
        data: {
            category,
            brand
        }
    })
}

exports.getProductStats = async (req, res) => {
    const stats = await Product.aggregate([
        {
            $group: {
                _id: '$category',
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                avgPrice: { $avg: '$price' },
                numProducts: { $sum: 1 }
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
}
