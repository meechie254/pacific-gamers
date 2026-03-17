# Zenca Gamers - Modern Gaming E-commerce Backend

A comprehensive, modern backend API for a gaming e-commerce platform built with Node.js, Express.js, and SQLite. Features user authentication, product management, order processing, and admin functionality.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with role-based access
- **Product Management** - Full CRUD operations with categories and reviews
- **Order Processing** - Complete order lifecycle with inventory management
- **Contact System** - Message handling with priority levels
- **Admin Dashboard** - Comprehensive admin functionality
- **Review System** - User reviews and ratings for products
- **Wishlist & Cart** - User shopping features

### Modern Enhancements
- **Security First** - Helmet, rate limiting, input validation
- **Performance** - Compression, database indexing, pagination
- **Developer Experience** - Structured logging, error handling, testing setup
- **Scalability** - Modular architecture, database migrations
- **API Design** - RESTful endpoints with consistent response format

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with proper schema design
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi schema validation
- **Security**: Helmet, bcryptjs, CORS
- **Logging**: Winston
- **Testing**: Jest + Supertest

## 📁 Project Structure

```
zenca-gamers-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   │   ├── AuthController.js
│   │   ├── ProductController.js
│   │   ├── OrderController.js
│   │   └── ...
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication middleware
│   │   └── validation.js # Input validation
│   ├── models/          # Database models
│   │   └── Database.js  # Database connection & queries
│   ├── routes/          # API route definitions
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── messages.js
│   └── utils/           # Utility functions
│       └── logger.js    # Logging utility
├── scripts/             # Database migration scripts
├── uploads/             # File upload directory
├── logs/               # Application logs
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
├── server.js           # Main application entry point
└── README.md           # This file
```

## 🗄 Database Schema

### Users Table
```sql
- id (Primary Key)
- username (Unique)
- email (Unique)
- password_hash
- first_name, last_name
- phone, avatar_url
- role (user/admin)
- is_active, email_verified
- created_at, updated_at
```

### Products Table
```sql
- id (Primary Key)
- name, description
- price, category_id (Foreign Key)
- stock_quantity, image_url
- featured, is_active
- created_at, updated_at
```

### Orders & Order Items
Complete order management with transaction support and inventory tracking.

### Additional Tables
- Categories, Reviews, Messages, Wishlist, Cart

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd zenca-gamers-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Start the development server
npm run dev
```

### Environment Variables
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
DB_PATH=./database.sqlite
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filtering/pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get product categories
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Messages
- `POST /api/messages` - Send contact message
- `GET /api/messages/admin` - Get all messages (Admin)
- `PUT /api/messages/:id/status` - Update message status (Admin)

### Legacy Endpoints (Backward Compatibility)
- `POST /api/orders` - Legacy order creation
- `POST /api/contact` - Legacy contact form
- `GET /api/admin/orders` - Legacy admin orders
- `GET /api/admin/messages` - Legacy admin messages

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevents abuse
- **Input Validation** - Joi schema validation
- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **CORS** - Cross-origin resource sharing control
- **SQL Injection Protection** - Parameterized queries

## 📈 Performance Optimizations

- **Database Indexing** - Optimized queries
- **Compression** - Response compression
- **Pagination** - Efficient data loading
- **Connection Pooling** - Database connection management
- **Caching Ready** - Structure supports caching layers

## 🔄 Database Migrations

Run migrations to update database schema:

```bash
node scripts/migrate.js
```

## 📝 Logging

Application logs are stored in the `logs/` directory:
- `error.log` - Error messages
- `all.log` - All log levels
- Console output in development

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set strong `JWT_SECRET`
- [ ] Configure email settings
- [ ] Set up proper CORS origins
- [ ] Enable SSL/HTTPS
- [ ] Set up monitoring and alerts

### Docker Support (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Default Admin Credentials:**
- Email: `admin@zencagamers.com`
- Password: `admin123`

⚠️ **Change these credentials in production!**