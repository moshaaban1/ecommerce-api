const nodemailer = require('nodemailer')

const sendEmail = async options => {
    // create a transporter object
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // send mail with defined transport object
    await transporter.sendMail({
        from: '"Mohamed Shaban 👻" <shop.smart@example.com>', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.message // plain text body
        // html: '<b>Hello world?</b>' // html body
    })
}

module.exports = sendEmail
