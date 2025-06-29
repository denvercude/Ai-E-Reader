import s3 from '../config/s3.js';
import Book from '../models/book.model.js';
// The import below brings in a function that can generate a random unique ID. We're using
// it to make sure each uploaded file has a unique id.
import { v4 as uuidv4 } from 'uuid';
// The import below uses Node's built-in path module to work with file paths.
import path from 'path';
import mongoose from 'mongoose';

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

        // Create a new book with the book metadeta and S3 lcoation in MongoDB
        const {
            title,
            author,
            publicationDate,
            ISBN,
            genre,
            description,
        } = req.body;

        const newBook = await Book.create({
            title,
            author,
            publicationDate,
            ISBN,
            genre,
            description,
            fileUrl: result.Location
        });

        res.status(200).json({
            message: 'Book uploaded and saved successfully',
            book: newBook
        });
    }catch (err) {
        console.error('Upload error:', err.message, err.stack);
        res.status(500).json({error: 'Failed to upload file' });
    };
};

export const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        return res.status(200).json({ success: true, data: books })
    } catch (error){
        return res.status(500).json({ success: false, message: error.message }); 
    }
};

export const getBookById = async (req, res) => {
    // gets the book id from request parameters in the url
    const { id } = req.params();

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(401).json({ success: false, message: "Invalid book id"});
    }

    try {
        console.log("Left off here");
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}