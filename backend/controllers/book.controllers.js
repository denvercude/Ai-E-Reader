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
            fileUrl: result.Location,
            user: req.user._id
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
        const books = await Book.find({ user: req.user._id });
        return res.status(200).json({ success: true, data: books })
    } catch (error){
        return res.status(500).json({ success: false, message: error.message }); 
    }
};

export const getBookById = async (req, res) => {
    // gets the book id from request parameters in the url
    const { id } = req.params;

    // makes sure the book id is a valid mongoose id object
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(401).json({ success: false, message: "Invalid book id"});
    }

    try {
        // attempts to find the book 
        const book = await Book.findById(id);

        // return a 404 if the book isn't in the database
        if(!book) {
            return res.status(404).json({ success: false, message: "Book not found."});
        }

        // if the user id from the jwt token does not match the user id reference
        // in the book, then access is denied
        if(!book.user.equals(req.user._id)) {
            return res.status(403).json({ success: false, message: "Access denied: User doesn't own this book"});
        }

        // send the book if everything is good
        return res.status(200).json({ success: true, data: book});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const updateBook = async (req, res) => {
    // get the book id
    const { id } = req.params;

    // validate the id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid book id" })
    }

    try {
        // find the book in the database
        const book = await Book.findById(id);

        // if you couldn't find it, send error code/message
        if(!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        // check if th user owns the book
        if(!book.user.equals(req.user._id)) {
            return res.status(403).json({ success: false, message: "Access denied: User does not own this book" });
        }

        // create an array of whitelisted fields
        const allowedUpdates = ['title', 'author', 'publicationDate', 'ISBN', 'genre', 'description'];

        // so this essentially goes through every field in the allowedUpdates array and says..
        // if the user has provided a new value for this field (!== undefined), then update
        // that field in the selected book with the value they've provided
        allowedUpdates.forEach(field => {
            if(req.body[field] !== undefined){
                book[field] = req.body[field];
            }
        });

        // save the updated book to the databse
        const updatedBook = await book.save();

        return res.status(200).json({ success: true, data: updateBook });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBook = async (req, res) => {
    // get the book id
    const { id } = req.params;

    //validate the book id
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid book id"})
    }

    try {
        // find the book in the databse
        const book = await Book.findById(id);

        if(!book) {
            return res.status(404).json({ success: false, message: "Book not found"});
        }

        // make sure the user owns this book
        if (!book.user.equals(req.user._id)) {
            return res.status(403).json({ success: false, message: "Access denied: User does not own this book."})
        }

        // delete the book from the database
        await book.deleteOne();

        return res.status(200).json({ success: true, message: "Book deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};