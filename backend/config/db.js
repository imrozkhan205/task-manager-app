import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI
  try {
    // REMOVED: useNewUrlParser: true and useUnifiedTopology: true
    await mongoose.connect(mongoUri);
    
    console.log('MongoDB connected 🟢');
  } catch (error) {
    // It's good practice to ensure error.message is treated as a string
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    console.error('MongoDB connection error 🔴:', errorMessage);
    process.exit(1);
  }
};