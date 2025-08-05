import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from './models/user.model.js';

dotenv.config();

async function seedDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const demoUser = new User({username: "demoUser", email: "test@example.com", password: "hashedpassword"});
        await demoUser.save();

        console.log("Databse seeded");
        process.exit();
    }catch(error) {
        console.error(error); 
        process.exit(1);
    }
}

seedDB();