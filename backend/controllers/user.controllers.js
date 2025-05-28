import mongoose from "mongoose";
import { User } from '../models/user.model.js';

// GET all users
export const getUsers = async (req, res) => {
    try {
        // find() is a built-in mongoose function that says:
        // "go to the users collection in our database and get ALL the user documents"
        const users = await User.find();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET user by ID
export const getUserById = async (req, res) => {
    const { id } = req.params;

    // validation: make sure the ID is actually a valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    try {
        // findById is another built-in mongoose function — self-explanatory:
        // "go to the database and find ONE document that matches this id"
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST create new user
// NOTE: This doesn't hash passwords yet, so don't use it for production login/signup
export const createUser = async (req, res) => {
    const { username, email, password } = req.body;

    // make sure all fields were sent in the request
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide username, email, and password'
        });
    }

    try {
        // create() combines 'new User()' and 'user.save()' in one step
        const newUser = await User.create({ username, email, password });
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT update user
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // make sure the ID is in valid MongoDB format before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    try {
        // findByIdAndUpdate: updates and returns the user (if found)
        // passing { new: true } means it will return the updated version, not the original
        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE user
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
