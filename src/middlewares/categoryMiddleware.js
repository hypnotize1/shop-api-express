import sharp from "sharp";
import AppError from "../utils/appError.js";

// --- MIDDLEWARE: Resize single Category image ---
export const resizeCategoryImage = async (req, res, next) => {
  // 1. If no file is uploaded, move to the next middleware
  if (!req.file) {
    return next();
  }

  // 2. Generate the image buffer using sharp
  const filename = `category-${Date.now()}.webp`;

  // 3. Process the image buffer using Sharp
  await sharp(req.file.buffer)
    .resize(500, 500) // Square size for categories
    .toFormat("webp")
    .webp({ quality: 90 })
    .toFile(`public/images/categories/${filename}`);

  // 4. Inject the filename into req.body so the controller can use it directly
  req.body.image = filename;

  next();
};
