import s3 from '../config/s3.js';
import Book from '../models/book.model.js';
// The import below brings in a function that can generate a random unique ID. We're using
// it to make sure each uploaded file has a unique id.
import { v4 as uuidv4 } from 'uuid';
// The import below uses Node's built-in path module to work with file paths.
import path from 'path';

export const uploadBook = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({error: 'No file uploaded'});
        }

        const file = req.file;

        const fileExtension = path.extname(file.originalname);

        // This creates a unique path for storing the file in S3. It tells it to go in a books/
        // folder and its name will be a random UUID + orgiginal file's extension.
        const s3Key = `books/${uuidv4()}${fileExtension}`;

        // Create settings for the S3 upload here.
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        // This actually uploads the file
        const result = await s3.upload(uploadParams).promise();

        // If we make it this far we successfully uploaded so we return a 200 success code
        // and the relevant data.
        res.status(200).json({
            message: 'File successfully uploaded',
            url: result.Location,
            key: result.Key
        });
    }catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to upload file' });
    };
};