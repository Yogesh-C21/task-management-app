const nodemailer = require('nodemailer');
const config = require("../config/config")

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    port: 465,
    auth: {
        user: config.getMailId(), // Your email
        pass: config.getMailPassword(), // Your email password or app-specific password
    },
});

module.exports = transporter
