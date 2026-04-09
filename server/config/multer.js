import multer from "multer";

// Use memory storage for file uploads to avoid filesystem path issues and ensure
// we can upload directly to Cloudinary from buffer.
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;