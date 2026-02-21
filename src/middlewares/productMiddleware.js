import sharp from "sharp";
import AppError from "../utils/appError.js";

export const resizeProductImages = async (req, res, next) => {
  // 1. If no images are uploaded, just move to the next middleware.
  // We DO NOT throw an error because during a PATCH request,
  // admin might only want to update text without sending new images.
  if (!req.files || req.files.length === 0) {
    return next();
  }

  // 2. Initialize an empty array to hold the new filenames
  req.body.images = [];

  // 3. Process each uploaded image in parallel for maximum performance
  await Promise.all(
    req.files.map(async (file, index) => {
      const filename = `product-${Date.now()}-${index + 1}.webp`;

      await sharp(file.buffer)
        .resize(800, 800) // Resize to perfect square
        .toFormat("webp") // Convert to WebP format
        .webp({ quality: 90 }) // Set webP quality to 90%
        .toFile(`public/images/products/${filename}`);

      // Add the new filename to req.body.images array
      req.body.images.push(filename);
    }),
  );
  // 4. Move to the controller
  next();
};
