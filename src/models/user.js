import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },

    role: {
      type: String,
      default: "customer",
      enum: ["customer", "admin"],
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  { timestamps: true },
);

// --- Methods ---

// hide private data when sending user data to client
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.refreshTokens;
  delete userObject.avatar;
  delete userObject.__v;

  return userObject;
};

// Generate Access and Refresh Tokens
userSchema.methods.generateAuthTokens = async function () {
  const user = this;

  // 1. Create short-lived Access Token
  const accessToken = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  // 2. Create long-lived Refresh Token
  const refreshToken = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  // 3. Save Refresh Token in database
  user.refreshTokens = user.refreshTokens.concat({ token: refreshToken });
  await user.save();

  return { accessToken, refreshToken };
};

// --- Statics ---
// find user by email and password for login
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

// --- Middleware ---
// hash the plain text password before saving
userSchema.pre("save", async function () {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

// Generate temporary token
userSchema.methods.createPasswordResetToken = function () {
  // 1. Generate a random and simple string
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. Hash the token for save in database
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Update expire time
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// create and export User model
const User = mongoose.model("User", userSchema);

export default User;
