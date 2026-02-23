import Category from "../models/category.js";
import AppError from "../utils/appError.js";
import { deleteOldImages } from "../utils/deleteFiles.js";

// --------------------------------------------------
// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (Admin only)
export const createCategory = async (req, res) => {
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
};

// --------------------------------------------------
// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = async (req, res) => {
  // We populate the 'parent' field to see the name of the parent category
  const categories = await Category.find().populate("parent", "name");

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      categories,
    },
  });
};

// --------------------------------------------------
// @desc  Update a category
// @route PUT /api/categories/:id
// @access Private (Admin only)
export const updateCategory = async (req, res) => {
  // 1. Find the category to check the old image
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError("No Category found with that ID", 404);
  }

  // 2. Update slug automatically if the name is being updated
  if (req.body.name) {
    req.body.slug = req.body.name.toLowerCase().split(" ").join("-");
  }

  // 3. Handle old image deletion if a new image is uploaded
  if (req.file && category.image) {
    await deleteOldImages([category.image], "categories");
  }

  // 4. Apply the updates
  Object.assign(category, req.body);
  await category.save();

  // 5. Send response
  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
};

// --------------------------------------------------
// @desc  Delete a category
// @route DELETE /api/categories/:id
// @access Private (Admin only)
export const deleteCategory = async (req, res) => {
  // 1. Find the category
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError("No Category found with that ID", 404);
  }

  // 2. Delete the physical image file from the server
  if (category.image) {
    await deleteOldImages([category.image], "categories");
  }

  // 3. Remove the category from the database
  await category.deleteOne();

  // 4. Send response
  res.status(204).send();
};
