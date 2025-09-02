import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected 🟢');
  } catch (error) {
    console.error('MongoDB connection error 🔴:', error.message);
    process.exit(1);
  }
};


