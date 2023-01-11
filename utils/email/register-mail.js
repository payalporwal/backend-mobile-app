const subject_mail = "PACE App: OTP Verification After Registration"

const message = (otp, username) =>{
     return `Hi ${username},`
     + `🎉 Thank you for signing up for the Pace App! 🎉\n\n`
     + `Your one-time password (OTP) is: ${otp}\n\n`
     + `Please enter this OTP in the required field on the registration page to complete your registration and start using the app 💻\n\n`
     + `If you have any trouble using the OTP, please don't hesitate to contact us for assistance 🤗 We're here to help!\n\n`
     + `Take care,\n\n`
     + `— \n`
     + `This is an auto-generated email. Please do not reply to this email.\n\n`
     + `Thanks and Regards,\n`
     + `The PACE Team \n`
}

module.exports={subject_mail, message};