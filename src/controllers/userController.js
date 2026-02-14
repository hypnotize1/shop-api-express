import User from "../models/user.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import crypto from "crypto";
import sendEmail from "../utils/email.js";

// SIGNUP
export const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  // manual validation
  if (!name || !email || !password) {
    throw new AppError("Please provide name, email and password!", 400);
  }

  // Create User
  const user = new User({ name, email, password });

  // Save (Hash password & Check unique email)
  await user.save();

  // Generate token for
  const token = await user.generateAuthToken();

  // Send Response (JSON)
  res.status(201).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
});

// LOGIN
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Check the inputs
  if (!email || !password) {
    throw new AppError("Please provide email and password!", 400);
  }

  // Use static method for compare both passwords by email inserted
  // if user not found or passwords doesn't match = ERROR
  const user = await User.findByCredentials(email, password);

  // Create new token
  const token = await user.generateAuthToken();

  // Send response
  res.status(200).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
});

// LOGOUT
export const logout = catchAsync(async (req, res) => {
  // Target = delete current token from user tokens array
  req.user.tokens = req.user.tokens.filter((tokenObj) => {
    return tokenObj.token !== req.token; // keep all tokens, except the token that user logged in with it.
  });

  await req.user.save();

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

// LOGOUT ALL (ALL SESSIONS)
export const logoutAll = catchAsync(async (req, res) => {
  // Target = clear tokens array
  req.user.tokens = [];
  await req.user.save();

  res.status(200).json({
    status: "success",
    message: "Logged out from all devices",
  });
});

// GET USER PROFILE INFORMATION
export const getProfile = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
};

// UPDATE PROFILE
export const updateProfile = catchAsync(async (req, res, next) => {
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
});

// DELETE ACCOUNT
export const deleteAccount = catchAsync(async (req, res) => {
  // Delete the user has logged in
  await User.deleteOne({
    _id: req.user._id,
  });

  // 204: "No Content"
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// FORGOT PASSWORD
export const forgotPassword = catchAsync(async (req, res) => {
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
});

// RESET PASSWORD
export const resetPassword = catchAsync(async (req, res) => {
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
  const token = await user.generateAuthToken();

  res.status(200).json({
    status: "success",
    token,
  });
});
