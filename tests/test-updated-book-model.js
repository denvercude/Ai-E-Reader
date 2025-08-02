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
            ISBN: "1234567890124",
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

        // Validate the saved data
         console.log("✓ Book created successfully");
         console.log("✓ Text array has", savedBook.text.length, "entries");
         console.log("✓ AI array has", savedBook.ai.length, "entries");
         console.log("✓ Total pages:", savedBook.totalPages);
         console.log("✓ Extraction status:", savedBook.extractionStatus);
         
         // Test querying by page
         const textPage1 = savedBook.text.find(t => t.page === 1);
         const aiPage1 = savedBook.ai.find(a => a.page === 1);
         console.log("✓ Can query page 1 text:", !!textPage1);
         console.log("✓ Can query page 1 AI:", !!aiPage1);
         
         // Clean up test data
         await Book.deleteOne({ _id: savedBook._id });
         console.log("✓ Test data cleaned up");

    } catch (error) {
        console.error("Error:", error.message);
        }finally {
            // Close the MongoDB connection
            await mongoose.disconnect();
            console.log("MongoDB connection closed");
        }
}

testBookModel();