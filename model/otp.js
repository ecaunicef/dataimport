const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: Number,
    default: 1,
  },
  purpose: {
    type: Number,
    required: true,
    comment:"1= user profile , 2= change password"
  }, // 1= user profile,
  ipAddress: {
    type: String,
    required: true,
  },
},{ timestamps: true });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
