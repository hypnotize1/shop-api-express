import User from "../models/user.js";
import AppError from "../utils/appError.js";
import sendEmail from "../utils/email.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// --- SIGNUP ---
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  // Manual validation
  if (!name || !email || !password) {
    throw new AppError("Please provide name, email and password!", 400);
  }

  // Create User instance
  const user = new User({ name, email, password });

  // Save (Hash password & Check unique email)
  await user.save();

  // Generate token (Access and Refresh Tokens)
  const { refreshToken, accessToken } = await user.generateAuthTokens();

  // Send Response (JSON)
  res.status(201).json({
    status: "success",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
};

// --- LOGIN ---
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Check the inputs
  if (!email || !password) {
    throw new AppError("Please provide email and password!", 400);
  }

  // Check user credentials
  const user = await User.findByCredentials(email, password);

  // Create new tokens (Access and Refresh Tokens)
  const { refreshToken, accessToken } = await user.generateAuthTokens();

  // Send response (JSON)
  res.status(200).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
};

// --- LOGOUT ---
export const logout = async (req, res, next) => {
  // Front should ask for delete which refresh token?
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh Token is required", 400);
  }

  // Target = delete the refresh token  from user refreshTokens in database
  req.user.refreshTokens = req.user.refreshTokens.filter((tokenObj) => {
    return tokenObj.token !== refreshToken;
  });

  await req.user.save();

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

// --- LOGOUT ALL ---
export const logoutAll = async (req, res, next) => {
  // Target = Clear all sessions
  req.user.refreshTokens = [];
  await req.user.save();

  res.status(200).json({
    status: "success",
    message: "Logged out from all devices",
  });
};

// --- REFRESH TOKEN ---
export const refreshAuthToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  // 1. Verify Refresh Token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  // 2. Check if the token exists in database for this user
  const user = await User.findOne({
    _id: decoded._id,
    "refreshTokens.token": refreshToken,
  });

  // Throw error if user or token not found
  if (!user) {
    throw new AppError("Invalid refresh token", 401);
  }

  // 3. Create a new access Token
  const accessToken = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  // 4. Send new token
  res.status(200).json({
    status: "success",
    accessToken,
  });
};

// --- GET USER PROFILE INFORMATION ---
export const getProfile = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
};

// --- UPDATE PROFILE ---
export const updateProfile = async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowUpdates.includes(update),
  );

  if (!isValidOperation) {
    throw new AppError("Invalid updates!", 400);
  }

  // We update manually because findByIdAndUpdate goes away the middleware that hash the password
  updates.forEach((update) => (req.user[update] = req.body[update]));

  await req.user.save(); // Password will be hash if its changed

  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
};

// --- DELETE ACCOUNT ---
export const deleteAccount = async (req, res, next) => {
  // Delete the user has logged in
  await User.deleteOne({
    _id: req.user._id,
  });

  // 204: "No Content"
  res.status(204).json({
    status: "success",
    data: null,
  });
};

// --- FORGOT PASSWORD ---
export const forgotPassword = async (req, res, next) => {
  // 1. Find user by email
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    throw new AppError("There is no user with this email address.", 404);
  }

  // 2. Generate temporary token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to an user email
  const resetUrl = `${req.protocol}://${req.get("host")}/api/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError(
      "There was an Error sending the email, Try again later",
      500,
    );
  }
};

// --- RESET PASSWORD ---
export const resetPassword = async (req, res, next) => {
  // 1. Hash the token comes from url
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // 2. Find user and check the if token expired or not
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 3. If user did not found (token is wrong or expired)
  if (!user) {
    throw new AppError("Token is invalid or has expired", 400);
  }

  // 4. Set new password
  user.password = req.body.password;

  // 5. Clear fields about resetting password
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 6. Save changes
  await user.save();

  // 7. Login automatically (Generate new jwt token)
  const { accessToken, refreshToken } = await user.generateAuthTokens();

  res.status(200).json({
    status: "success",
    accessToken,
    refreshToken,
  });
};
