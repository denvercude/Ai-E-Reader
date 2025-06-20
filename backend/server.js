import express from 'express'
import dotenv from "dotenv"
import { connectDB } from './config/db.js';
import userRoutes from './routes/user.routes.js'
import bookRoutes from './routes/book.routes.js' 

dotenv.config()

const app = express();

app.use(express.json());

// Base route
app.get('/', (req, res) => {
    res.send("Server is ready");
})

// User API route
app.use('/users', userRoutes);

// Book API route
app.use('/books', bookRoutes);

// Start server and connect to database
app.listen(5000, () => {
    connectDB()
    console.log('Server is running at http://localhost:5000')
})