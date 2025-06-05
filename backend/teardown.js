import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from './models/user.model.js';

dotenv.config();

async function teardownDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await User.deleteMany({});

        console.log("Database cleared");
    }catch(error){
        console.error(error);
        process.exit(1);
    }
}

teardownDB();