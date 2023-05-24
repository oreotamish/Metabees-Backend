const nodemailer = require("nodemailer");
require("dotenv").config();


//creating the nodemailer transporter
var transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"metabees.test.email@gmail.com",
        pass:process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false,
    }
});

//using the mail options to send
var mailOptions = {
    from: 'metabees.test.email@gmail.com',
    subject: 'Metabees Password Reset'
};

module.exports = {transporter,mailOptions};