# Ecommerce Frontend

A modern React-based frontend for the ecommerce platform with a beautiful UI and excellent user experience.

## Features

- **Modern UI/UX**: Built with React 19 and Tailwind CSS for a responsive, modern design
- **Authentication**: Complete user registration and login system
- **Shopping Cart**: Persistent cart with local storage
- **Product Management**: Browse and search products
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Admin Panel**: Admin-only routes for managing products, orders, and users
- **Real-time Updates**: React Query for efficient data fetching and caching

## Tech Stack

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Data Fetching**: React Query + Axios
- **Icons**: React Icons
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Header, Footer)
│   └── products/       # Product-related components
├── contexts/           # React Context providers
├── pages/              # Page components
│   └── admin/          # Admin-only pages
├── App.jsx             # Main app component
└── main.jsx            # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Authentication

- User registration and login
- Protected routes
- JWT token management
- Automatic token refresh

### Shopping Cart

- Add/remove products
- Update quantities
- Persistent storage
- Cart total calculation

### Product Management

- Product browsing
- Search and filtering
- Product details
- Add to cart functionality

### Admin Features

- Admin-only routes
- User management
- Product management
- Order management

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api`. Make sure the backend server is running before using the frontend.

## Environment Variables

Create a `.env` file in the frontend root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Deployment

1. Build the project:

```bash
npm run build
```

2. The built files will be in the `dist` directory

3. Deploy the contents of the `dist` directory to your hosting provider

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
