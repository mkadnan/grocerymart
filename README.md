# GroceryMarts - Full-Stack Grocery E-commerce Application

A modern, full-stack grocery e-commerce application built with React, Node.js, Express, and MongoDB. Features include user authentication, referral system with credit rewards, shopping cart, order management, and comprehensive admin panel.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based signup and login system
- **Referral System**: Multi-level referral program with credit rewards
- **Product Catalog**: Browse and search grocery products by category
- **Shopping Cart**: Add products to cart and manage quantities
- **Order Management**: Place orders using credits or cash
- **Credit System**: Earn and spend credits through referrals and purchases
- **Monthly Purchase Restrictions**: Prevent multiple purchases per month when using credits

### Admin Features
- **Admin Dashboard**: Comprehensive overview with statistics
- **Product Management**: Add, edit, delete, and manage product inventory
- **Order Management**: View and manage all customer orders
- **User Management**: View user accounts, credit balances, and referral chains
- **Referral Analytics**: Track referral performance and credit distribution

### Technical Features
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Role-based Access Control**: Separate user and admin interfaces
- **RESTful API**: Well-structured backend API with proper error handling
- **Data Validation**: Input validation on both frontend and backend
- **Security**: Password hashing, JWT tokens, and protected routes

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation middleware
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **pnpm**
- **MongoDB** (v4.4 or higher)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GroceryMarts
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Configure Environment Variables

Edit the `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/grocerymarts

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
```

### 4. MongoDB Setup

#### Option A: Local MongoDB Installation

1. **Install MongoDB Community Edition**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install -y mongodb-org
   
   # macOS (using Homebrew)
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Windows
   # Download and install from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB Service**:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # macOS
   brew services start mongodb/brew/mongodb-community
   
   # Windows
   # MongoDB should start automatically after installation
   ```

3. **Verify MongoDB is Running**:
   ```bash
   mongosh --eval "db.runCommand('ping')"
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI` in `.env`

### 5. Seed the Database

```bash
# From the backend directory
npm run seed
```

This will create:
- Demo products (Rice, Milk, Bread, Bananas, Tomatoes)
- Test user account: `user@test.com` / `password123`
- Admin account: `admin@test.com` / `admin123`

### 6. Start the Backend Server

```bash
# From the backend directory
npm run dev
```

The backend server will start on `http://localhost:5000`

### 7. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend/grocerymarts-frontend

# Install dependencies
pnpm install

# Start development server
pnpm run dev --host
```

The frontend will start on `http://localhost:5173`

## 🎯 Usage Guide

### For Regular Users

1. **Registration**:
   - Visit `http://localhost:5173`
   - Click "Sign Up" and create an account
   - Optionally enter a referral code to give credits to your referrer

2. **Shopping**:
   - Browse products on the homepage
   - Add items to your cart
   - Proceed to checkout
   - Use credits or pay with cash

3. **Referral System**:
   - Share your referral code with friends
   - Earn 50 credits for each successful referral
   - Main parent in the chain earns 100 credits

### For Administrators

1. **Admin Login**:
   - Use credentials: `admin@test.com` / `admin123`
   - Access admin panel at `http://localhost:5173/admin`

2. **Product Management**:
   - Add new products with details and pricing
   - Update existing product information
   - Manage inventory and stock levels

3. **Order Management**:
   - View all customer orders
   - Track order status and payment methods
   - Monitor credit usage across orders

4. **Analytics**:
   - View referral statistics
   - Monitor user growth and engagement
   - Track revenue and credit distribution

## 🧪 Testing the Application

### Test Accounts

| Role  | Email | Password | Credits | Purpose |
|-------|-------|----------|---------|---------|
| User  | user@test.com | password123 | 100 | Regular user testing |
| Admin | admin@test.com | admin123 | 500 | Admin panel testing |
| User  | john@test.com | password123 | 0 | Additional user for referral testing |

### Testing Scenarios

#### 1. User Registration and Referral System

```bash
# Test referral signup
1. Register a new user with referral code from existing user
2. Check that referrer receives 50 credits
3. Verify referral chain is properly established
4. Test 12-level referral limit
```

#### 2. Shopping and Credit Usage

```bash
# Test shopping flow
1. Login as regular user
2. Add products to cart
3. Checkout using credits
4. Verify monthly purchase restriction
5. Test order history
```

#### 3. Admin Panel Features

```bash
# Test admin functionality
1. Login as admin user
2. Access admin dashboard
3. Manage products (CRUD operations)
4. View order management
5. Check referral statistics
```

### API Testing

You can test the API endpoints directly using curl or Postman:

```bash
# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "referral_code": "EXISTING_CODE"
  }'

# Test user login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "password123"
  }'

# Test getting products
curl http://localhost:5000/api/products

# Test authenticated endpoint (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/auth/me
```

## 📁 Project Structure

```
GroceryMarts/
├── backend/                    # Node.js/Express backend
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── seed.js            # Database seeding script
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── orderController.js # Order management
│   │   └── productController.js # Product management
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── User.js            # User model with referral system
│   │   ├── Product.js         # Product model
│   │   └── Order.js           # Order model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── products.js        # Product routes
│   │   └── orders.js          # Order routes
│   ├── .env                   # Environment variables
│   ├── package.json           # Backend dependencies
│   └── server.js              # Express server setup
├── frontend/grocerymarts-frontend/  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   └── Layout.jsx     # Main layout component
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx # Authentication context
│   │   │   └── CartContext.jsx # Shopping cart context
│   │   ├── lib/
│   │   │   └── api.js         # API service functions
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Homepage with products
│   │   │   ├── Login.jsx      # Login page
│   │   │   ├── Register.jsx   # Registration page
│   │   │   └── AdminDashboard.jsx # Admin panel
│   │   ├── App.jsx            # Main app component with routing
│   │   └── main.jsx           # React entry point
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
└── README.md                  # This file
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation using express-validator
- **CORS Protection**: Configured for secure cross-origin requests
- **Role-based Access**: Admin routes protected from regular users
- **SQL Injection Prevention**: MongoDB and Mongoose provide protection
- **XSS Protection**: React's built-in XSS protection

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup**:
   ```bash
   # Production environment variables
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

2. **Build and Deploy**:
   ```bash
   # Install production dependencies
   npm ci --only=production
   
   # Start production server
   npm start
   ```

### Frontend Deployment

1. **Build for Production**:
   ```bash
   # From frontend directory
   pnpm run build
   ```

2. **Deploy Static Files**:
   - Upload the `dist/` folder to your hosting provider
   - Configure your web server to serve the React app
   - Set up proper routing for single-page application

### Recommended Hosting Platforms

- **Backend**: Heroku, DigitalOcean, AWS EC2, Railway
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas, DigitalOcean Managed Databases

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   ```
   - Ensure MongoDB is running: `sudo systemctl status mongod`
   - Check MongoDB URI in `.env` file
   - Verify MongoDB is listening on port 27017

2. **JWT Token Errors**:
   ```
   Error: jwt malformed
   ```
   - Check JWT_SECRET in `.env` file
   - Clear browser localStorage and login again
   - Verify token format in API requests

3. **CORS Errors**:
   ```
   Access to fetch blocked by CORS policy
   ```
   - Ensure backend CORS is configured correctly
   - Check frontend API base URL
   - Verify both servers are running

4. **Port Already in Use**:
   ```
   Error: listen EADDRINUSE :::5000
   ```
   - Kill existing process: `lsof -ti:5000 | xargs kill -9`
   - Use different port in `.env` file
   - Check for other applications using the port

### Debug Mode

Enable debug logging by setting environment variables:

```bash
# Backend debugging
DEBUG=app:* npm run dev

# Frontend debugging
VITE_DEBUG=true pnpm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@grocerymarts.com
- Documentation: Check this README and inline code comments

## 🎉 Acknowledgments

- **shadcn/ui** for beautiful React components
- **Tailwind CSS** for utility-first styling
- **MongoDB** for flexible document database
- **Express.js** for robust web framework
- **React** for powerful frontend library

---

**Happy Coding! 🛒✨**