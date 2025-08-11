const twilio = require('twilio');
const OTP = require('../models/OTP');

class OTPService {
  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async sendOTP(mobile) {
    try {
      // Delete any existing OTPs for this mobile
      await OTP.deleteMany({ mobile });

      const otp = this.generateOTP();
      
      // Save OTP to database
      const otpDoc = new OTP({
        mobile,
        otp
      });
      await otpDoc.save();

      // For development - always log OTP to console (since Twilio is not configured)
      console.log(`\n=== OTP SENT ===`);
      console.log(`Mobile: ${mobile}`);
      console.log(`OTP: ${otp}`);
      console.log(`Valid for: 5 minutes`);
      console.log(`================\n`);
      
      // Send SMS (if Twilio is configured)
      if (this.client && process.env.TWILIO_PHONE_NUMBER) {
        try {
          await this.client.messages.create({
            body: `Your DB Skills Portal verification code is: ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${mobile}`
          });
          console.log(`OTP also sent via SMS to ${mobile}`);
        } catch (smsError) {
          console.log(`SMS sending failed, but OTP is available in console: ${smsError.message}`);
        }
      }

      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  }

  async verifyOTP(mobile, otp) {
    try {
      const otpDoc = await OTP.findOne({
        mobile,
        otp,
        verified: false,
        expiresAt: { $gt: new Date() }
      });

      if (!otpDoc) {
        return { success: false, message: 'Invalid or expired OTP' };
      }

      // Mark OTP as verified
      otpDoc.verified = true;
      await otpDoc.save();

      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }
}

module.exports = new OTPService();