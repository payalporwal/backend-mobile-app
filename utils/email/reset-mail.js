const subject_mail = "OTP: For Resetting Password"

const message = (otp, username) =>{
    return `Hi ${username},

Your one-time password (OTP) is: ${otp}. It will expire in 5 minutes.

If you didn't request for a resetting password. Do not share OTP, it will not change your password.
Reach out to our us at 'support@paceful.org' in any case of trouble.

Take care,\n
— 
This is an auto-generated email. Please do not reply to this email.
    
Thanks and Regards,
The PACE Team`
}

module.exports = {subject_mail, message};