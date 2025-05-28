import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from '../backend/routes/user.routes.js';
import { connectDB } from '../backend/config/db.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

beforeAll(async () => {
    await connectDB();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('GET /users', () => {
  it('should return 200 and an array (even if empty)', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});