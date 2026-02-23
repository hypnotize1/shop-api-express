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
    path: "owner",
    select: "name",
  });
  next();
});

// ---  CALCULATE AVERAGE RATINGS ---
reviewSchema.statics.calcAverageRatings = async function (productId) {
  // 1. Use the  Aggregation Pipeline
  const stats = await this.aggregate([
    {
      // a) Match only the reviews that belong to this specific product
      $match: { product: productId },
    },
    {
      // b) Group the reviews by product and apply math operations
      $group: {
        _id: "$product",
        nRating: { $sum: 1 }, // Add 1 for each review to calculate the total quantity
        avgRating: { $avg: "$rating" }, // Calculate the average of the 'rating' field
      },
    },
  ]);

  // Step 2: Update the product with the new statistics
  if (stats.length > 0) {
    // If the product has at least one review, save the new stats
    // Note: We call the Product model this way to avoid circular dependency issues
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // If the user deletes the only review, reset the stats to 0
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

// ---  TRIGGER THE CALCULATION ---
// This middleware runs automatically after a new review is saved to the database
reviewSchema.post("save", function () {
  // 'this' points to the current review document being saved
  // 'this.constructor' points to the Review model
  this.constructor.calcAverageRatings(this.product);
});

// --- TRIGGER THE CALCULATION (ON UPDATE & DELETE) ---
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
