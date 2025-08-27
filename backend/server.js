import express from 'express'
import dotenv from "dotenv"
import cors from 'cors';
import { connectDB } from './config/db.js';
import userRoutes from './routes/user.routes.js'
import bookRoutes from './routes/book.routes.js' 
import ocrRoutes from './routes/ocr.routes.js';

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use(cors());

// Base route
app.get('/', (req, res) => {
    res.send("Server is ready");
})

// User API route
app.use('/users', userRoutes);

// Book API route
app.use('/books', bookRoutes);

// OCR API route
app.use('/api', ocrRoutes);

// Start server and connect to database
app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running at http://localhost:${PORT}`)
})