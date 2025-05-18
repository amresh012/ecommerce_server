const asyncHandle = require("express-async-handler");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const OTP = require("../models/otpmodel");
const userModel = require("../models/userModel");
const { generateToken } = require("../config/jwtToken");

require("dotenv").config();

const sendOtpOnMail = asyncHandle(async (req, res) => {
  const otp = randomstring.generate({
    length: 4,
    charset: "numeric",
  });
  const html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">KFS Fitness</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing KFS Fitness. Use the following OTP to complete your to continue of submition. OTP is valid for 5 minutes only</p>
    <h2 style="background: blue;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />KFS Fitness Team</p>
    <hr style="border:none;border-top:1px solid #eee" />
    
  </div>
</div>`;
  if (req.body.email) {
    const { email } = req.body;

    const user = await userModel.findOne({email});
    if(!user){
      res.status(404).json({ status: 404, success: false, message: "User doesn't exist." });
    }

    try {
      const token = await user.createPasswordResetToken();
      await user.save()
      await OTP.create({ email, otp });
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      let info = await transporter.sendMail({
        from: "<amreshmishra67099@gmail.com>",
        to: email,
        subject: "OTP verification by KFS Fitness",
        // text: otp, // plain text body
        html: html,
      });
      res.status(200).json({ status: 200, success: true, message: "OTP generated and sent successfully", token:token });
    } catch (error) {
      console.error("Error generating OTP", error);
      res.status(401).json({ status: 410, success: false, message: "Failed to generate OTP" });
    }
  } else {
    res.status(401).json({ status: 401, success: false, message: "Please enter a valid email" });
  }
});
const verifyOtp = async (req, res) => {
  
  if (req.body.email) {
    const { email, otp } = req.body;
    const otpverify = await OTP.findOne({ email, otp });
    
    if (otpverify) {
      await OTP.deleteOne({email, otp});
      res.status(200).json({
        success: true,
        status: 200,
        message: "OTP verified successfully"
      });
    } else {
      res.status(401).json({
        success: true,
        status: 401,
        message: "Invalid OTP"
      });
    }
  } else if (req.body.mobile) {
    const { mobile, otp } = req.body;
    const otpverify = await OTP.findOne({ mobile, otp });

    if (otpverify) {
      await OTP.deleteOne({mobile, otp});
      const user = await userModel.findOne({mobile});
      return res.status(200).json({
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        mobile: user?.mobile,
        token: generateToken(user?._id),
        role: user?.role,
        cart: user?.cart,
        address: user?.address,
        super: user?.super,
        success: true,
        status: 200,
        message: "OTP verified successfully"
      });
    } else {
      res.status(401).json({success: false, status: 401, message: "Inavlid OTP"});
    }
  } else {
    return res.status(401).json({
      status: 401,
      success: false,
      message: "Invalid data"
    });
  }
};
module.exports = { sendOtpOnMail, verifyOtp };
