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

  // create user and save
  const user = new User({ name, email, password });
  await user.save();

  // generate token for
  const token = await user.generateAuthToken();

  res.status(201).send({ user, token });
});
