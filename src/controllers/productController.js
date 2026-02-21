import Product from "../models/product.js";
import AppError from "../utils/appError.js";
import { deleteOldImages } from "../utils/deleteFiles.js";

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin only)
export const createProduct = async (req, res, next) => {
  // 1. Destructure the required fields from the request body
  const { title, price, description, category } = req.body;

  // 2. Manual validation
  if (!title || !price || !description || !category) {
    throw new AppError(
      "Please provide all required fields: title, price, description and category",
      400,
    );
  }

  // 3. Create a new Product instance
  const newProduct = new Product({
    ...req.body,
    owner: req.user._id,
  });

  // 4. Save the product to the database
  await newProduct.save();

  // 5. Send success response
  res.status(201).json({
    status: "success",
    data: {
      product: newProduct,
    },
  });
};

// @desc   Get all products (Filter, Sort, Limit Fields, Pagination)
// @route  GET /api/products
// @access Public
export const getAllProducts = async (req, res, next) => {
  // 1. --- FILTERING ---
  // Create shallow copy of query object to exclude special fields
  const queryObj = { ...req.query };
  console.log(req.query);
  const excludeFields = ["page", "sort", "limit", "fields", "search"];
  excludeFields.forEach((el) => delete queryObj[el]);

  // Advanced Filtering:‌ Convert operators
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Product.find(JSON.parse(queryStr));

  // 2. --- SEARCH (By Name)---
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i"); // Case-insensitive regex
    query = query.find({ title: searchRegex });
  }

  // 3. --- SORTING ---
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // 4. --- FIELD LIMITING ---
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // 5. ---- PAGINATION ----
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 50;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // 6. --- POPULATE ---
  query = query.populate("category", "name slug").populate("owner", "name");

  // 7. --- EXECUTE QUERY ---
  const products = await query;

  // Get count based on applied filters
  const totalDocs = await Product.countDocuments(query.getFilter());

  // 8. --- SEND RESPONSE ---
  res.status(200).json({
    status: "success",
    results: products.length,
    currentPage: page,
    totalPages: Math.ceil(totalDocs / limit),
    data: {
      products,
    },
  });
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
  // 1. Find the product by ID and populate related fields
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug") // Get category name and slug
    .populate("owner", "name email"); // Get owner name

  // 2. If product not found, return 404 error
  if (!product) {
    throw new AppError("No product found with that ID", 404);
  }
  // 3. Send success response with product data
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
};

// @desc   Update a product by ID
// @route  PATCH /api/products/:id
// @access Private (Admin only)
export const updateProduct = async (req, res, next) => {
  // 1. Find the product first (We need this to know old images)
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("No product found with that ID", 404);
  }

  const allowedFields = [
    "title",
    "price",
    "description",
    "category",
    "images",
    "stock",
  ];
  const updates = {};

  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el) && req.body[el] !== undefined) {
      updates[el] = req.body[el];
    }
  });

  // --- HANDLE IMAGE REPLACEMENT ---
  // 2. If user uploaded new files, delete old ones from hard drive
  if (req.files && req.files.length > 0) {
    await deleteOldImages(product.images);
  }

  // 3. Apply updates to the product instance
  Object.assign(product, updates);

  // 4. Save the updated product to the database
  await product.save();

  // 5. Send success response
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
};

// @desc  Delete a product by ID
// @route DELETE /api/products/:id
// @access Private (Admin only)
export const deleteProduct = async (req, res, next) => {
  // 1. Find the product to get its images array
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("No product found with that ID", 404);
  }

  // 2. Delete product images from hard drive
  await deleteOldImages(product.images);

  // 3. Delete the product from database
  await product.deleteOne();

  // 4. Send success response with no content
  res.status(204).json({
    status: "success",
    data: null,
  });
};
