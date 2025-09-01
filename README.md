# Ecommerce Platform

A full-stack ecommerce platform built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### Frontend (React)

- Modern, responsive UI with Tailwind CSS
- User authentication and authorization
- Shopping cart with persistent storage
- Product browsing and search
- Admin panel for management
- Real-time updates with React Query

### Backend (Node.js/Express)

- RESTful API with Express.js
- JWT authentication
- MongoDB database with Mongoose ODM
- User management system
- Product management with categories
- Order processing system
- Review and rating system
- Security features (rate limiting, CORS, validation)

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Hot Toast** - Notifications

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

## 📁 Project Structure

```
MIS/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.jsx         # Main app
│   ├── package.json
│   └── README.md
├── backend/                  # Node.js backend
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   ├── package.json
│   └── README.md
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
# Copy config.env.example to config.env and update values
cp config.env.example config.env
```

4. Update `config.env` with your MongoDB connection string:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

5. Start the development server:

```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Product Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Order Endpoints

- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/myorders` - Get user orders
- `PUT /api/orders/:id/pay` - Mark order as paid
- `PUT /api/orders/:id/deliver` - Mark order as delivered (Admin)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid token in the Authorization header:

```
Authorization: Bearer <token>
```

## 🛡️ Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- Input validation with express-validator
- CORS configuration
- Security headers with helmet
- Protected admin routes

## 🎨 UI Features

- Responsive design for all devices
- Modern, clean interface
- Shopping cart with real-time updates
- Product search and filtering
- User-friendly forms with validation
- Toast notifications for user feedback

## 🚀 Deployment

### Backend Deployment

1. Set up a MongoDB database (MongoDB Atlas recommended)
2. Deploy to platforms like Heroku, Railway, or DigitalOcean
3. Set environment variables in your hosting platform
4. Update CORS origins for production

### Frontend Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to platforms like Vercel, Netlify, or GitHub Pages
3. Update API URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation in the respective `README.md` files
2. Look for existing issues in the repository
3. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Inventory management
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

---

**Happy coding! 🎉**
