import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./config.env" });

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@ecommerce.com" });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: admin@ecommerce.com");
      console.log("Password: admin123456");
      console.log("Role: admin");
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: "Admin",
      email: "admin@ecommerce.com",
      password: "admin123456",
      role: "admin",
      phone: "9800000000",
      address: {
        street: "Admin Address",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        country: "Nepal",
      },
    });

    await adminUser.save();

    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@ecommerce.com");
    console.log("Password: admin123456");
    console.log("Role: admin");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdmin();
