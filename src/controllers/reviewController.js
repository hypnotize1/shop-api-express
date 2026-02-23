import Review from "../models/review.js";
import AppError from "../utils/appError.js";

// @desc     Create a new review
// @route    POST /api/products/:productId/reviews
// @access   Private (Logged in users only)
export const createReview = async (req, res, next) => {
  // 1. Allow nested routes
  // If product ID is not in the body, get it from the URL parameter

  if (!req.body.product) req.body.product = req.params.productId;
  // If owner ID is not in the body, get it from the authenticated user (Security!)
  if (!req.body.owner) req.body.owner = req.user._id;

  // 2. Create the new review
  // NOTE: Duplicate reviews are automatically prevented by the compound index in the Review model
  const newReview = await Review.create({
    ...req.body,
  });

  // 3. Send response
  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
};

// @desc 		Get all reviews (or reviews for a specific product)
// @route   GET /api/reviews/
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getAllReviews = async (req, res, next) => {
  // 1. Filter reviews if a specific product ID is provided in the URL
  let filter = {};
  if (req.params.productId) filter = { product: req.params.productId };

  // 2. Execute query
  const reviews = await Review.find(filter);

  // 3. Send response
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
};

// @desc    Update a review
// @route   PATCH /api/reviews/:id
// @access  Private (Only the review owner)
export const updateReview = async (req, res, next) => {
  // 1. Find the review first to check ownership
  let review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError("No review found with this ID", 404);
  }

  // 2. Authorization: Check if the logged-in user is the owner of this review
  if (
    review.owner.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new AppError("You are not allowed to update this review", 403);
  }

  // 3. Update the review
  review = Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // 4. Send response
  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
};

// @desc      Delete a review
// @route     DELETE /api/reviews/:id
// @access    Private (Only the review owner or admin)
export const deleteReview = async (req, res, next) => {
  // 1. Find the review to check ownership
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError("No review found with that ID", 404);
  }

  // 2. Authorization: Check if user owns the review
  if (review.owner.toString() !== req.user._id) {
    throw new AppError("You are not allowed to delete this review", 403);
  }

  // 3. Delete the review
  await Review.findByIdAndDelete(req.params.id);

  // 4. send response
  res.status(204).json({
    status: "success",
    data: null,
  });
};
