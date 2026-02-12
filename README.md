# Masjid Finder - Backend API

RESTful API for the Masjid Finder application. Built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User, Admin, Main Admin)
  - First user automatically becomes Main Admin
  - Password hashing with bcrypt

- **Masjid Management**
  - CRUD operations for masjids
  - Geospatial queries for nearby masjids
  - Prayer times management
  - Location-based search with coordinates

- **Request System**
  - Users can request admin access
  - Users can request to add/edit/delete masjids
  - Main admin approval workflow
  - Request tracking and status updates

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone 
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/masjid-finder
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
NODE_ENV=development
```

**Important Environment Variables:**
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens (minimum 32 characters)
- `NODE_ENV`: Environment mode (development/production)

### 4. MongoDB Setup

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas (Cloud):**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Go to "Database Access" → Create database user
4. Go to "Network Access" → Add IP Address → Allow access from anywhere (0.0.0.0/0)
5. Go to "Clusters" → Connect → Get connection string
6. Replace `<password>` with your database password
7. Update `MONGODB_URI` in `.env`

### 5. Start the server

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run at: `http://localhost:5000`

## 📁 Project Structure
```
backend/
├── config/
│   └── db.js                      # Database configuration
├── controllers/
│   ├── authController.js          # Authentication logic
│   ├── masjidController.js        # Masjid CRUD operations
│   └── requestController.js       # Request management
├── middleware/
│   └── auth.js                    # JWT verification & authorization
├── models/
│   ├── User.js                    # User schema (User, Admin, Main Admin)
│   ├── Masjid.js                  # Masjid schema with geolocation
│   └── Request.js                 # Request schema (add/edit/delete)
├── routes/
│   ├── authRoutes.js              # Authentication endpoints
│   ├── masjidRoutes.js            # Masjid endpoints
│   └── requestRoutes.js           # Request endpoints
├── .env                           # Environment variables (DO NOT COMMIT)
├── .gitignore
├── package.json
├── server.js                      # Application entry point
└── README.md
```

## 🔌 API Endpoints

### Base URL
```
Local: http://localhost:5000/api
Production: https://your-domain.onrender.com/api
```

### Authentication Routes

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/auth/register` | Register new user | No | - |
| POST | `/auth/login` | Login user | No | - |
| GET | `/auth/me` | Get current user | Yes | All |
| GET | `/auth/users` | Get all users | Yes | Main Admin |
| PUT | `/auth/users/:id/role` | Update user role | Yes | Main Admin |

### Masjid Routes

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/masjids` | Get all masjids | No | - |
| GET | `/masjids/nearby` | Get nearby masjids | No | - |
| GET | `/masjids/:id` | Get single masjid | No | - |
| POST | `/masjids` | Create masjid | Yes | Main Admin |
| PUT | `/masjids/:id` | Update masjid | Yes | Main Admin |
| DELETE | `/masjids/:id` | Delete masjid | Yes | Main Admin |

### Request Routes

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/requests` | Create request | Yes | All |
| GET | `/requests` | Get all requests | Yes | Main Admin |
| GET | `/requests/my-requests` | Get user's requests | Yes | All |
| PUT | `/requests/:id/process` | Approve/reject request | Yes | Main Admin |
| DELETE | `/requests/:id` | Delete request | Yes | Owner/Main Admin |

## 📝 API Usage Examples

### Register User (First user becomes Main Admin)
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "main_admin",
    "token": "jwt_token_here"
  },
  "message": "Main admin account created successfully"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "main_admin",
    "token": "jwt_token_here"
  }
}
```

### Get Nearby Masjids
```bash
GET /api/masjids/nearby?longitude=78.4867&latitude=17.3850&maxDistance=5000

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "name": "Al-Masjid An-Nabawi",
      "address": "123 Main Street",
      "location": {
        "type": "Point",
        "coordinates": [78.4867, 17.3850]
      },
      "prayerTimes": {
        "fajr": "05:30",
        "dhuhr": "12:30",
        "asr": "16:00",
        "maghrib": "18:30",
        "isha": "20:00",
        "jummah": "13:00"
      }
    }
  ]
}
```

### Create Masjid (Main Admin only)
```bash
POST /api/masjids
Authorization: Bearer 
Content-Type: application/json

{
  "name": "Al-Masjid An-Nabawi",
  "address": "123 Main Street, City",
  "latitude": 17.3850,
  "longitude": 78.4867,
  "prayerTimes": {
    "fajr": "05:30",
    "dhuhr": "12:30",
    "asr": "16:00",
    "maghrib": "18:30",
    "isha": "20:00",
    "jummah": "13:00"
  },
  "description": "Beautiful mosque in the city center",
  "phoneNumber": "+1234567890"
}
```

### Request to Add Masjid (Regular User/Admin)
```bash
POST /api/requests
Authorization: Bearer 
Content-Type: application/json

{
  "type": "add_masjid",
  "masjidData": {
    "name": "New Masjid",
    "address": "456 Street",
    "latitude": 17.4000,
    "longitude": 78.5000,
    "prayerTimes": {
      "fajr": "05:30",
      "dhuhr": "12:30",
      "asr": "16:00",
      "maghrib": "18:30",
      "isha": "20:00"
    }
  },
  "reason": "This masjid was recently built"
}
```

### Request Admin Access
```bash
POST /api/requests
Authorization: Bearer 
Content-Type: application/json

{
  "type": "admin_access",
  "reason": "I want to help manage masjids in my area"
}
```

### Approve/Reject Request (Main Admin)
```bash
PUT /api/requests/:requestId/process
Authorization: Bearer 
Content-Type: application/json

{
  "status": "approved",
  "adminResponse": "Request approved. Welcome to the admin team!"
}
```

## 🔐 Authentication

This API uses JWT (JSON Web Tokens) for authentication.

### How to Use:
1. Register or login to receive a token
2. Include token in Authorization header for protected routes:
```
   Authorization: Bearer <your-jwt-token>
```

### Token Expiration:
- Tokens expire after 30 days
- After expiration, user must login again

## 👥 User Roles

### User (Default)
- View masjids
- Submit requests for:
  - Admin access
  - Adding masjids
  - Editing masjids
  - Deleting masjids

### Admin
- All User permissions
- Cannot directly add/edit/delete masjids
- Must submit requests to Main Admin
- Cannot delete any masjids

### Main Admin (First Registered User)
- All permissions
- Directly add/edit/delete masjids
- Approve/reject all requests
- Grant admin access to users
- Cannot be demoted

## 🌍 Geospatial Features

### Nearby Search
Uses MongoDB's geospatial queries with 2dsphere index:
```javascript
// Find masjids within 5km radius
GET /api/masjids/nearby?longitude=78.4867&latitude=17.3850&maxDistance=5000
```

**Parameters:**
- `longitude`: Longitude coordinate (required)
- `latitude`: Latitude coordinate (required)
- `maxDistance`: Search radius in meters (default: 5000)

## 🚀 Deployment

### Deploy to Render

1. **Push code to GitHub**
```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin 
   git push -u origin main
```

2. **Create Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** `masjid-finder-api`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free

3. **Set Environment Variables in Render**
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = Your secure secret key (32+ characters)
   - `PORT` = `5000` (auto-set by Render)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Your API will be live at: `https://your-service.onrender.com`

### MongoDB Atlas Setup for Production

1. **Create MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Create a free M0 cluster
   - Choose a cloud provider and region

3. **Database Access**
   - Go to "Database Access"
   - Create a database user with password
   - Save credentials securely

4. **Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow access from anywhere" (0.0.0.0/0)
   - This is necessary for Render deployment

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Use this as `MONGODB_URI` in Render

## 🧪 Testing

### Manual Testing with cURL

**Health Check:**
```bash
curl https://your-api.onrender.com/api/health
```

**Register User:**
```bash
curl -X POST https://your-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get All Masjids:**
```bash
curl https://your-api.onrender.com/api/masjids
```

### Using Postman

1. Import the API endpoints
2. Set up environment variables for base URL and token
3. Test each endpoint individually
4. Create automated test collections

## 🐛 Troubleshooting

### MongoDB Connection Error
- **Problem:** `MongoNetworkError: failed to connect`
- **Solution:** 
  - Check if MongoDB is running
  - Verify `MONGODB_URI` is correct
  - For Atlas: Check network access settings (allow 0.0.0.0/0)

### CORS Error
- **Problem:** `Access-Control-Allow-Origin` error
- **Solution:**
  - Verify frontend URL is in CORS whitelist in `server.js`
  - Update CORS configuration:
```javascript
    app.use(cors({
      origin: ['https://your-frontend.vercel.app'],
      credentials: true
    }));
```

### Authentication Failed
- **Problem:** "Not authorized" or "Token invalid"
- **Solution:**
  - Verify JWT token is valid
  - Check if token is included in Authorization header
  - Ensure `JWT_SECRET` matches between environments
  - Token format: `Bearer <token>`

### Port Already in Use
- **Problem:** `EADDRINUSE: address already in use`
- **Solution:**
  - Kill the process using the port:
```bash
    # Windows
    netstat -ano | findstr :5000
    taskkill /PID  /F
    
    # Mac/Linux
    lsof -ti:5000 | xargs kill -9
```
  - Or change the port in `.env`

### Request Validation Errors
- **Problem:** "Please provide all required fields"
- **Solution:**
  - Check request body format
  - Ensure all required fields are included
  - Verify content-type is `application/json`

## 📚 Dependencies
```json
{
  "express": "^4.18.2",          // Web framework
  "mongoose": "^7.5.0",           // MongoDB ODM
  "bcryptjs": "^2.4.3",          // Password hashing
  "jsonwebtoken": "^9.0.2",      // JWT authentication
  "dotenv": "^16.3.1",           // Environment variables
  "cors": "^2.8.5",              // CORS middleware
  "express-validator": "^7.0.1"  // Input validation
}
```

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

Created for the Muslim community to easily find nearby masjids.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review documentation

## 🔄 API Versioning

Current version: v1

All endpoints are prefixed with `/api`

## 🔒 Security Best Practices

1. **Never commit `.env` file**
2. **Use strong JWT_SECRET** (minimum 32 characters)
3. **Enable CORS only for trusted domains**
4. **Keep dependencies updated**: `npm audit fix`
5. **Use HTTPS in production**
6. **Implement rate limiting** for production
7. **Sanitize user inputs**
8. **Use environment variables** for sensitive data

## 📊 Performance Tips

1. **Database Indexing:** Geospatial index on location field
2. **Connection Pooling:** MongoDB connection pool
3. **Caching:** Consider Redis for frequently accessed data
4. **Pagination:** Implement for large datasets
5. **Compression:** Use compression middleware

---

**Made with ❤️ for the Muslim community**
