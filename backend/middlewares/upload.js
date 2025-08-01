// multer is a library that helps Express handle file uploads
import multer from 'multer';

// First temporarily hold uploaded files in RAM
const storage = multer.memoryStorage();

// This creates an upload object using multer
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // This limits the file size to 20MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed'), false);
        }
        cb(null, true);
    }
});

export default upload;