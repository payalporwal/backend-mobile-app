const subject_mail = "OTP: For Resetting Password"

const message = (otp, username) =>{
    return `Hi ${username},

🎉 Thank you for signing up for the Pace App! 🎉

Your one-time password (OTP) is: ${otp}

Please enter this OTP in the required field on the registration page to complete your registration and start using the app 💻
If you have any trouble using the OTP, please don't hesitate to contact us for assistance 🤗 We're here to help!

Take care,\n
— 
This is an auto-generated email. Please do not reply to this email.
    
Thanks and Regards,
The PACE Team`
}

module.exports = {subject_mail, message};