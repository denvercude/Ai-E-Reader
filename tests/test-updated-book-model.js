import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "../backend/models/book.model.js";

dotenv.config();

async function testBookModel() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB");

        const sampleBook = new Book ({
            title: "Sample Book",
            author: "Esai A",
            publicationDate: new Date("2025-08-01"),
            ISBN: "1234567890123",
            genre: "Technology",
            description: "A sample book for testing purposes.",
            fileUrl: "http://example.com/sample-book.pdf",
            user: new mongoose.Types.ObjectId(), // Mock user ID
            
            text: [
                { page: 1, content: "This is the content of page 1." },
                { page: 2, content: "This is the content of page 2." },
            ],
            ai: [
                { page: 1, content: "AI generated content for page 1." },
                { page: 2, content: "AI generated content for page 2." },
            ],
            totalPages: 2,
            textExtracted: true,
            extractionStatus: "completed",
        });

        const savedBook = await sampleBook.save();
        console.log("Book saved:\n", JSON.stringify(savedBook, null, 2));
    } catch (error) {
        console.error("Error:", err.message);
        }finally {
            // Close the MongoDB connection
            await mongoose.disconnect();
            console.log("MongoDB connection closed");
        }
}

testBookModel();