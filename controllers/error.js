const AppError = require('../utils/apiError')

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const messageValue = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
    const message = `Duplicate field value: ${messageValue}. Please use another value!`
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors)
        .map(el => el.message)
        .join('. ')
    console.log(errors)

    const message = `Invalid input data. ${errors}`
    return new AppError(message, 400)
}

const sendErrorDev = (error, res) => {
    res.status(error.statusCode).json({
        status: error.status,
        error,
        stack: error.stack
    })
}

const sendErrorPro = (error, res) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        })
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        })
    }
}

exports.error = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500
    error.status = error.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res)
    } else if (process.env.NODE_ENV === 'production') {
        if (error.name === 'CastError') error = handleCastErrorDB(error)
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error)

        sendErrorPro(error, res)
    }
}
