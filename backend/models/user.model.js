import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});


// This encrypts passowrds prior to saving the user in the database.
userSchema.pre('save', async function (next) {
  if(!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error);
  }
});


// This is a method to check if the submitted password's encrypted version
// matches the encrypted password for that user in our database. It is
// called in the loginUser method in our user.controller.js file
userSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

export const User = mongoose.model('User', userSchema);