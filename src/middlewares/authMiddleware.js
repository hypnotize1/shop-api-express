import jwt from "jsonwebtoken";
import User from "../models/user.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const auth = catchAsync(async (req, res, next) => {
  // 1. Check the header
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    throw new AppError("Please authenticate.", 401);
  }

  // 2. Get token from header
  const token = authHeader.replace("Bearer ", "");

  // 3. Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 4. Find user
  const user = await User.findOne({
    _id: decoded._id,
    "tokens.token": token,
  });

  if (!user) {
    throw new AppError("User not found or session expired.", 401);
  }

  // 5. Add user information to req
  req.token = token;
  req.user = user;

  next();
});

// Get allowed roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};
