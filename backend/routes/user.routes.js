import express from 'express';

import{
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/user.controllers.js';

const router = express.Router();

// GET all users
router.get('/', getUsers);

// GET user by id
router.get('/:id', getUserById);

// POST create a new user
router.post('/', createUser);

// PUT update user by id
router.put('/:id', updateUser);

// DELETE user by id
router.delete('/:id', deleteUser);

export default router;