const express = require('express')

const router = express.Router()

const authControllers = require('../controllers/auth')

router.route('/login').post(authControllers.login)

router.route('/register').post(authControllers.register)

router.route('/forgetPassword').post(authControllers.forgetPassword)

router.route('/restPassword/:restToken').patch(authControllers.resetPassword)

router
    .route('/updatePassword')
    .patch(authControllers.isAuth, authControllers.updatePassword)

module.exports = router
