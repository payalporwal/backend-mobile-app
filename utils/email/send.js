const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = async (email_message, email_subject, email ) => {
    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            },
        
        });
        
        //set email
        const mailOptions = {
            from: `"PACE"<${process.env.EMAIL_ADDRESS}>`,
            to: `${email}`,
            subject: email_subject,
            text: email_message ,
        };
        
        await transporter.verify();
        
        //send mail
        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                return next(new HttpError('Something went wrong, Try Again', false, 500));
            } else {
                console.log("Server is ready to take our messages");
            }
        });
    } catch(err){
        return next(new HttpError('Something went wrong, Try Again', false, 500));
    }
}