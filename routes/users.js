const express = require('express')

const router = express.Router()

const userControllers = require('../controllers/user')
const authControllers = require('../controllers/auth')

router.get(
    '/',
    authControllers.isAuth,
    authControllers.roles('admin'),
    userControllers.getAllUsers
)

router
    .route('/user')
    .get(authControllers.isAuth, userControllers.getUser)
    .delete(authControllers.isAuth, userControllers.deleteUser)
    .patch(authControllers.isAuth, userControllers.updateMe)

module.exports = router
