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
    fileSize: {
        type: Number, // size in bytes
        required: false, 
        min: 0 // file size cannot be negative
    }
}, {
    timestamps: true // automatically adds createdAt and updatedAt fields
})

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