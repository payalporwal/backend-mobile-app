const nodemailer = require('nodemailer');
const HttpError = require('../http-error');
require('dotenv').config();

module.exports = async (email_message, email_subject, email, type ) => {
    try {let email_address, email_password;
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
    await transporter.sendMail(mailOptions);
    console.log('Email Sent');
    } catch (error){
        console.log(error);
        throw new HttpError(error, false, 500);
    }
}