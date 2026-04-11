import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      minlength: 6,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    verificationOtp: {
      type: String,
      default: null,
    },
    verificationOtpExpiresAt: {
      type: Date,
      default: null,
    },
    authOtp: {
      type: String,
      default: null,
    },
    authOtpExpiresAt: {
      type: Date,
      default: null,
    },
    authOtpChannel: {
      type: String,
      enum: ["email", "phone", null],
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("fullName").get(function fullNameGetter() {
  return this.name;
});

userSchema.virtual("profilePic").get(function profilePicGetter() {
  return this.avatar;
});

const User = mongoose.model("User", userSchema);

export default User;
