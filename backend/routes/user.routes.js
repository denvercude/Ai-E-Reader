import express from 'express';
import{
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser
} from '../controllers/user.controllers.js';
import { protect } from '../middlewares/authentication.js';

const router = express.Router();

// POST User login to get JWT (public)
router.post('/login', loginUser);

// Some routes are now protected by JWT authorization
// Users must log in and have a valid JWT token to use the routes below.

// GET all users (protected)
router.get('/', protect, getUsers);

// GET user by id (protected)
router.get('/:id', protect, getUserById);

// POST create a new user
router.post('/', createUser);

// PUT update user by id (protected)
router.put('/:id', protect, updateUser);

// DELETE user by id (protected)
router.delete('/:id', protect, deleteUser);

export default router;