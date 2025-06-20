import express from 'express'
const router = express.Router()

import {
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook
} from '../controllers/book.controller.js'

// Get all books
router.get('/', getAllBooks) // Route to get all books

// Get a book by ID
router.get('/:id', getBookById) // Route to get a book by its ID

// Update a book by ID
router.put('/:id', updateBook) // Route to update a book by its ID

// Delete a book by ID
router.delete('/:id', deleteBook) // Route to delete a book by its ID

// Export the router
export default router // Export the book routes for use in the main app


/* This file defines the routes for book-related operations in the application.
It includes routes to get all books, get a book by ID, update a book, and delete a book.
Each route is linked to a specific controller function that handles the request and response.
The router is then exported for use in the main application file.
This modular approach helps keep the code organized and maintainable.
The routes are defined using Express.js, a web application framework for Node.js.
*/