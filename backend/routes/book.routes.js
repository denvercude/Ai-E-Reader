import express from 'express';
import upload from '../middlewares/upload.js';

import {
  uploadBook
  // getAllBooks,
  // getBookById,
  // updateBook,
  // deleteBook
} from '../controllers/book.controller.js';

const router = express.Router();

// Upload a book's PDF to S3 storage
router.post('/upload', upload.single('pdf'), uploadBook);

// Get all books
// router.get('/', getAllBooks);

// Get a book by ID
// router.get('/:id', getBookById);

// Update a book by ID
// router.put('/:id', updateBook);

// Delete a book by ID
// router.delete('/:id', deleteBook);

export default router;


/* This file defines the routes for book-related operations in the application.
It includes routes to get all books, get a book by ID, update a book, and delete a book.
Each route is linked to a specific controller function that handles the request and response.
The router is then exported for use in the main application file.
This modular approach helps keep the code organized and maintainable.
The routes are defined using Express.js, a web application framework for Node.js.
*/