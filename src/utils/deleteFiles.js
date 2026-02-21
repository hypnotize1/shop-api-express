import fs from "fs/promises";
import path from "path";

// --- Delete files dynamically from any folder in public/images ---
export const deleteOldImages = async (imageArray, folderName = "products") => {
  // 1. Return immediately if there is no image to delete
  if (!imageArray || imageArray.length === 0) return;

  // 2. Loop through the array of images names
  for (const imageName of imageArray) {
    try {
      // 3. Construct the exact physical path on the server
      // Using folderName makes this function reusable for users, categories, etc.
      const filePath = path.join(
        path.resolve(),
        "public",
        "images",
        folderName,
        imageName,
      );

      // 4. Delete the file from the hard drive
      await fs.unlink(filePath);
    } catch (error) {
      // 5. Silently log the error so the app doesn't crash if the file is already deleted or not found
      console.error(
        `[File System Warning] Failed to delete ${imageName}:`,
        error.message,
      );
    }
  }
};
