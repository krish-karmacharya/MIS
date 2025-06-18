import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    const mongoose = require("mongoose");
    const dbURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
};
