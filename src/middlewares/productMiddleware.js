import sharp from "sharp";
import AppError from "../utils/appError.js";

export const resizeProductImages = async (req, res, next) => {
  // 1. Check if there are any files in the request
  if (!req.files || req.files.length === 0) {
    return next(new AppError("No images uploaded", 400));
  }

  // 2. Array to hold the processed image filenames
  req.body.images = [];

  // 3. Process each uploaded image parallely
  await Promise.all(
    req.files.map(async (file, index) => {
      const filename = `product-${Date.now()}-${index + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(800, 800) // Resize to 800x800 pixels
        .toFormat("webp") // Convert to WebP format
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${filename}`);

      // Add the filename to the images array in the request body
      req.body.images.push(filename);
    }),
  );
  next();
};
