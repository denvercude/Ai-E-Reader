import mongoose from "mongoose"

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 200,
    },
    author: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100,
    },
    publicationDate: {
        type: Date,
        required: false
    },
    ISBN: { // International Standard Book Number and is 10 or 13 characters long
        type: String,
        required: true,
        unique: true, // ensures ISBN is unique across all books
        trim: true,
        minlength: 10,
        maxlength: 13,
    },
    genre: {
        type: String,
        required: false,
        trim: true,
        minlength: 1,
        maxlength: 50
    },
    description: {
        type: String,
        required: false,
        trim: true,
        minlength: 1,
        maxlength: 1000
    },
    fileUrl: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // *new This field is for storing the text content of the book, if needed
    // array of objects, each object contains page number and content
    text: [
        {
            page: { type: Number, required: true },
            content: { type: String, required: true },
        },
    ],
    ai: [
        {
            page: { type: Number, required: true },
            content: { type: String, required: true },
        },
    ],
    totalPages: {
        type: Number,
        default: 0 // default to 0 if not provided
    },
    textExtracted: {
        type: Boolean,
        default: false // default to false if not provided
    },
    extractionStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending' // default to pending if not provided
    },
    extractionError: {
        type: String,
        default: null // default to null if not provided
    },
}, {
    timestamps: true // automatically adds createdAt and updatedAt fields
})

bookSchema.pre('save', function (next) {
    // Check for duplicate pages in text array
    const textPages = this.text.map(item => item.page);
    if (textPages.length !== new Set(textPages).size) {
        return next(new Error('Duplicate pages found in text array'));
    }

    // Check for duplicate pages in ai array
    const aiPages = this.ai.map(item => item.page);
    if (aiPages.length !== new Set(aiPages).size) {
        return next(new Error('Duplicate pages found in ai array'));
    }
    next();
});

//indexes for performance
bookSchema.index({ user: 1 }) // for faster user lookups
bookSchema.index({'text.page': 1}) // for faster text lookups by page
bookSchema.index({'ai.page': 1}) // for faster AI lookups by page

const Book = mongoose.model("Book", bookSchema) // Create the Book model using the bookSchema
export default Book 

/*
created book schema with fields
title, author, publicationDate, ISBN, genre, description
and timestamps for createdAt and updatedAt.
This schema can be used to create, read, update, and delete book records in a MongoDB database.
I didn't include a user reference here, as the book model is independent of users.
I also didn't create ID fields, as Mongoose automatically creates an _id field for each document.
*/ 