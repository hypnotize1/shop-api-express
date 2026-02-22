import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ---  PREVENT DUPLICATE REVIEWS ---
// Compound Index: A user can only write ONE review for a specific product
reviewSchema.index({ owner: 1, product: 1 }, { unique: true });

// ---  AUTO-POPULATE USER DATA ---
// Automatically populate the user's name every time we query reviews
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
