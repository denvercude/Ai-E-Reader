import express from 'express'
import dotenv from "dotenv"
import cors from 'cors';
import { connectDB } from './config/db.js';
import userRoutes from './routes/user.routes.js'
import bookRoutes from './routes/book.routes.js' 

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start server and connect to database
app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running at http://localhost:${PORT}`)
})