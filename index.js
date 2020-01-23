const express = require('express')
const cors = require('cors')
const cookieparser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const env = require('dotenv')

// Set App config
const app = express()
env.config('env')
const database = require('./database')

const productRoutes = require('./routes/products')
const usersRoutes = require('./routes/users')
const authRoutes = require('./routes/auth')
const reviewRoutes = require('./routes/review')

const errorController = require('./controllers/error')
const AppError = require('./utils/apiError')

// Set security HTTP headers
app.use('/api', helmet())

// Limit requests from the same IP
app.use(
    '/api',
    rateLimit({
        max: 100,
        windowMs: 60 * 60 * 1000,
        message: `Too many request from this IP, please try later.`
    })
)

// Body parser, reading data from body
app.use('/api', express.json())

// Solve MongoDB query injection attack issue
app.use('/api', mongoSanitize())

// Solve Cross-Origin Resource Sharing issue
app.use('/api', cors())

// Parse incoming parsers
app.use('/api', cookieparser())

// Handle Routes
app.use('/api/products', productRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/reviews', reviewRoutes)

// 404 Route
app.all('/api/*', (req, res, next) => {
    next(new AppError(`This ${req.originalUrl} is not exist`, 404))
})

// Global error middleware
app.use(errorController.error)

const port = process.env.PORT || 5000

// Listen the server
app.listen(port, () => {
    console.log(`App running on ${port}`)
})
