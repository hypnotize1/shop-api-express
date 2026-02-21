import multer from "multer";
import AppError from "../utils/appError.js";

// 1. Save in memory as buffer
const multerStorage = multer.memoryStorage();

// 2. File filter to accept only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only images are allowed", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// For Products, we allow multiple images, so we use upload.array
export const uploadProductImage = upload.array("images", 5);

// For Categories, we only allow one image, so we use upload.single
export const uploadCategoryImage = upload.single("image");
