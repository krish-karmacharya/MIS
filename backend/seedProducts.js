import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

// Load environment variables
dotenv.config({ path: "./config.env" });

const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    description:
      "The latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Features 48MP main camera, 3x optical zoom, and all-day battery life.",
    price: 132999,
    originalPrice: 147999,
    category: "Electronics",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    ],
    stock: 50,
    sku: "IPH15PRO-001",
    tags: ["smartphone", "apple", "5G", "camera"],
    specifications: {
      "Screen Size": "6.1 inches",
      Storage: "128GB",
      Color: "Natural Titanium",
      Chip: "A17 Pro",
    },
    rating: 4.8,
    numReviews: 1250,
    isFeatured: true,
    discount: 10,
  },
  {
    name: "Samsung Galaxy S24",
    description:
      "Premium Android smartphone with AI features, stunning display, and powerful performance. Includes S Pen support and advanced photography capabilities.",
    price: 119999,
    originalPrice: 133999,
    category: "Electronics",
    brand: "Samsung",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500",
    ],
    stock: 75,
    sku: "SAMS24-001",
    tags: ["smartphone", "android", "5G", "AI"],
    specifications: {
      "Screen Size": "6.2 inches",
      Storage: "256GB",
      Color: "Phantom Black",
      Chip: "Snapdragon 8 Gen 3",
    },
    rating: 4.7,
    numReviews: 890,
    isFeatured: true,
    discount: 10,
  },
  {
    name: "Nike Air Max 270",
    description:
      "Comfortable running shoes with Air Max technology for maximum cushioning. Perfect for daily runs and casual wear with breathable mesh upper.",
    price: 17289,
    originalPrice: 19950,
    category: "Clothing",
    brand: "Nike",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
    ],
    stock: 200,
    sku: "NIKE270-001",
    tags: ["shoes", "running", "sports", "comfortable"],
    specifications: {
      Material: "Mesh and Synthetic",
      Sole: "Rubber",
      Closure: "Lace-up",
      Weight: "280g",
    },
    rating: 4.6,
    numReviews: 2340,
    isFeatured: true,
    discount: 15,
  },
  {
    name: "Adidas Ultraboost 22",
    description:
      "Premium running shoes with responsive Boost midsole and Primeknit upper. Designed for energy return and comfort during long-distance runs.",
    price: 23999,
    originalPrice: 26600,
    category: "Clothing",
    brand: "Adidas",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500",
    ],
    stock: 150,
    sku: "ADIDASUB22-001",
    tags: ["shoes", "running", "boost", "premium"],
    specifications: {
      Material: "Primeknit",
      Sole: "Continental Rubber",
      Closure: "Lace-up",
      Weight: "310g",
    },
    rating: 4.9,
    numReviews: 1567,
    isFeatured: true,
    discount: 10,
  },
  {
    name: "The Great Gatsby",
    description:
      "F. Scott Fitzgerald's masterpiece about the Jazz Age and the American Dream. A classic novel that explores themes of wealth, love, and the pursuit of happiness.",
    price: 1728,
    originalPrice: 2127,
    category: "Books",
    brand: "Scribner",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
    ],
    stock: 300,
    sku: "BOOK-GATSBY-001",
    tags: ["classic", "fiction", "literature", "jazz age"],
    specifications: {
      Pages: "180",
      Language: "English",
      Format: "Paperback",
      ISBN: "978-0743273565",
    },
    rating: 4.8,
    numReviews: 2890,
    isFeatured: true,
    discount: 20,
  },
  {
    name: "To Kill a Mockingbird",
    description:
      "Harper Lee's Pulitzer Prize-winning novel about racial injustice in the American South. A powerful story of courage, compassion, and moral growth.",
    price: 1595,
    originalPrice: 1994,
    category: "Books",
    brand: "Grand Central",
    images: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
    ],
    stock: 250,
    sku: "BOOK-MOCKINGBIRD-001",
    tags: ["classic", "fiction", "social justice", "coming of age"],
    specifications: {
      Pages: "376",
      Language: "English",
      Format: "Paperback",
      ISBN: "978-0446310789",
    },
    rating: 4.9,
    numReviews: 3456,
    isFeatured: true,
    discount: 20,
  },
  {
    name: "Philips Hue Smart Bulb Starter Kit",
    description:
      "Smart lighting system with 3 color bulbs and bridge. Control your lights with your phone, voice assistants, or set automated schedules.",
    price: 26599,
    originalPrice: 33249,
    category: "Home & Garden",
    brand: "Philips",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
    ],
    stock: 100,
    sku: "PHILIPS-HUE-001",
    tags: ["smart home", "lighting", "automation", "wifi"],
    specifications: {
      "Bulbs Included": "3",
      Wattage: "9W each",
      Connectivity: "WiFi + Bluetooth",
      Compatibility: "Alexa, Google Home, Apple HomeKit",
    },
    rating: 4.7,
    numReviews: 1234,
    isFeatured: true,
    discount: 20,
  },
  {
    name: "Dyson V15 Detect Cordless Vacuum",
    description:
      "Powerful cordless vacuum with laser technology to reveal hidden dust. Features 60 minutes of runtime and advanced filtration system.",
    price: 93099,
    originalPrice: 106399,
    category: "Home & Garden",
    brand: "Dyson",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500",
    ],
    stock: 75,
    sku: "DYSON-V15-001",
    tags: ["vacuum", "cordless", "laser", "powerful"],
    specifications: {
      Runtime: "60 minutes",
      "Suction Power": "240 AW",
      Weight: "2.6kg",
      Filtration: "HEPA",
    },
    rating: 4.8,
    numReviews: 890,
    isFeatured: true,
    discount: 12,
  },
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected for seeding...");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert sample products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${createdProducts.length} products`);

    // Display created products
    createdProducts.forEach((product) => {
      console.log(
        `- ${product.name} (${product.category}) - $${product.price}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

// Run the seed function
seedProducts();
