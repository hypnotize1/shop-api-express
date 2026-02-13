import User from "../models/user.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

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
