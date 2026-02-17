import Category from "../models/category.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (Admin only)
export const createCategory = catchAsync(async (req, res) => {
  const { name, parent, image, description } = req.body;

  // 1. Check if name exist
  if (!name) {
    throw new AppError("Category name is required", 400);
  }

  // 2. Generate slug automatically if not provided
  let slug = req.body.slug;
  if (!slug) {
    slug = name.toLowerCase().split(" ").join("-");
  }

  // 3. Create the category
  const newCategory = await Category.create({
    name,
    slug,
    parent: parent || null,
    image,
    description,
  });

  // 4. Send response
  res.status(201).json({
    status: "success",
    data: {
      category: newCategory,
    },
  });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = catchAsync(async (req, res) => {
  // We populate the 'parent' field to see the name of the parent category
  const categories = await Category.find().populate("parent", "name");

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      categories,
    },
  });
});
