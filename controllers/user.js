const userModel = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/apiError')

const filterObj = (obj, ...fields) => {
    let newFields = {}
    Object.keys(obj).forEach(item => {
        if (fields.includes(item)) {
            newFields[item] = obj[item]
        }
    })
    return newFields
}

exports.getAllUsers = async (req, res, next) => {
    const users = await userModel.find()

    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    })
}

exports.getUser = (req, res, next) => {}

exports.deleteUser = catchAsync(async (req, res, next) => {
    await userModel.findByIdAndUpdate(res.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.updateMe = catchAsync(async (req, res, next) => {
    // Check if user POST password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password update. Please use /auth/updatePassword',
                400
            )
        )
    }

    // Update Current user data
    const filterBody = filterObj(req.body, 'name', 'email')
    const user = await userModel.findByIdAndUpdate(res.user.id, filterBody, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})
