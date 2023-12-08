import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expiry: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});

otpSchema.index({ expiry: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
export default mongoose.model.otps || mongoose.model("OTP", otpSchema);