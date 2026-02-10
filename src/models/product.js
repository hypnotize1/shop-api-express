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

    image: {
      type: String,
      required: false,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual Property
productSchema.virtual("isAvailable").get(function () {
  return this.stock > 0;
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
