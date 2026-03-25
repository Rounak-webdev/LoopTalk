import mongoose from "mongoose";

const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/looptalk";

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || LOCAL_MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error.message);
    console.log(`Tried URI: ${mongoUri}`);
  }
};
