const nodemailer = require('nodemailer');
const HttpError = require('../http-error');
require('dotenv').config();

module.exports = async (email_message, email_subject, email, type, next ) => {
    let email_address, email_password;
    if(type === 'support'){
        email_address = process.env.EMAIL_ADDRESS_SUPPORT,
        email_password = process.env.EMAIL_PASSWORD_SUPPORT
    } else if( type === 'no-reply'){
        email_address = process.env.EMAIL_ADDRESS_NO_REPLY,
        email_password = process.env.EMAIL_PASSWORD_NO_REPLY
    }

    
    //create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
            user: email_address,
            pass: email_password
        },
    
    });
    
    //set email
    const mailOptions = {
        from: `"PACE"<${email_address}>`,
        to: `${email}`,
        subject: email_subject,
        text: email_message ,
    };
    
    await transporter.verify();
    
    //send mail
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
            throw new HttpError(err, false, 500);
        } else {
            console.log("Server is ready to take our messages");
        }
    });
}