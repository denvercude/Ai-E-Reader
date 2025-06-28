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


// This is a method to matchPassowrds when user log in. It's not being used anywhere yet
// because the login feature hasn't been added. But once we add logging ing, we'll
// take the submitted password and use this to encrypt it and see if it matches the
// user's encrypted password in the database.
userSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);