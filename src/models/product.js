import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      validate(value) {
        if (value < 0) {
          throw new Error("Price must be a positive number");
        }
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },

    stock: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Stock cannot be negative");
        }
      },
    },

    images: {
      type: [String],
      required: false,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    discount: {
      type: Number,
      default: 0,
      validate(value) {
        if (value > 100 || value < 0) {
          throw new Error("Discount must be between 0 and 100");
        }
      },
    },

    sold: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: [1, "Rating must be above  1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual Properties
productSchema.virtual("isAvailable").get(function () {
  return this.stock > 0;
});

productSchema.virtual("imageCover").get(function () {
  if (this.images && this.images.length > 0) {
    return this.images[0];
  }
  return "default-product-image.webp";
});

// hide private data when sending product data to client
productSchema.methods.toJSON = function () {
  const product = this;
  const productObject = product.toObject();

  delete productObject.__v;
  return productObject;
};

const Product = mongoose.model("Product", productSchema);
export default Product;
