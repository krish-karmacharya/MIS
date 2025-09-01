# Ecommerce Backend API

A robust Node.js/Express backend API for an ecommerce platform with MongoDB database.

## Features

- **User Authentication**: JWT-based authentication with user registration and login
- **Product Management**: CRUD operations for products with search and filtering
- **Order Management**: Complete order lifecycle from creation to delivery
- **User Management**: Admin panel for user management
- **Security**: Password hashing, rate limiting, CORS, and input validation
- **Reviews**: Product review system with ratings

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, express-rate-limit

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

3. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Products

- `GET /api/products` - Get all products (with pagination, search, filtering)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `POST /api/products/:id/reviews` - Add product review

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (Admin only)
- `GET /api/orders/myorders` - Get user's orders
- `GET /api/orders` - Get all orders (Admin only)

### Users (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Database Models

### User

- name, email, password, role, avatar, address, phone, isActive

### Product

- name, description, price, category, brand, images, stock, rating, reviews

### Order

- user, orderItems, shippingAddress, paymentMethod, totalPrice, status

## Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- Input validation with express-validator
- CORS configuration
- Helmet for security headers

## Development

The server runs on `http://localhost:5000` by default.

For production, make sure to:

1. Change the JWT_SECRET to a strong, unique key
2. Set NODE_ENV to 'production'
3. Configure proper CORS origins
4. Use a production MongoDB instance
