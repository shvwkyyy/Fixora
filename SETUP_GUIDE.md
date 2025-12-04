# Fixora - Complete Setup Guide

This guide will help you set up and run the Fixora application with frontend, backend, and database connection.

## 📋 Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** (or local MongoDB installation)
- **Git** (optional, for cloning)

## 🗂️ Project Structure

```
Fixora/
├── Backend/          # Node.js + Express API
├── frontend/         # React + Vite frontend
└── Chatbot/         # React chatbot component (optional)
```

## 🚀 Quick Start

### Step 1: Backend Setup

1. **Navigate to Backend directory:**
   ```bash
   cd Fixora/Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** in `Fixora/Backend/`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=4000
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_ACCESS_EXPIRES=1h
   JWT_REFRESH_EXPIRES=7d
   ```

   **Important:** Replace `your_mongodb_connection_string` with your actual MongoDB Atlas connection string.
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/fixora?retryWrites=true&w=majority`
   - Make sure to whitelist your IP address in MongoDB Atlas

4. **Start the backend server:**
   ```bash
   node src/server.js
   ```

   You should see:
   ```
   connected to DB
   server is running on port 4000
   ```

### Step 2: Frontend Setup

1. **Open a new terminal and navigate to frontend:**
   ```bash
   cd Fixora/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional, defaults to `http://localhost:4000`):
   ```env
   VITE_API_URL=http://localhost:4000
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173` (or next available port)

### Step 3: MongoDB Atlas Setup

1. **Create a MongoDB Atlas account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a new cluster** (free tier is fine)

3. **Get your connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `fixora` (or your preferred database name)

4. **Whitelist your IP address:**
   - Go to "Network Access" in Atlas
   - Click "Add IP Address"
   - Click "Add Current IP Address" (or manually add your IP)
   - This allows your application to connect to the database

5. **Create a database user:**
   - Go to "Database Access" in Atlas
   - Click "Add New Database User"
   - Create a user with username and password
   - Save these credentials for your connection string

## 🧪 Testing the Application

### Test Backend API with Postman

1. **Import the Postman collection:**
   - Open Postman
   - Import `Fixora/Backend/tests/Fixora.postman_collection.json`

2. **Test endpoints:**
   - **Register User:** `POST http://localhost:4000/api/auth/register`
     ```json
     {
       "firstName": "Test",
       "lastName": "User",
       "email": "test@example.com",
       "password": "Password123!",
       "phone": "01012345678",
       "city": "Cairo",
       "area": "Nasr City",
       "userType": "user"
     }
     ```
   
   - **Login:** `POST http://localhost:4000/api/auth/login`
     ```json
     {
       "email": "test@example.com",
       "password": "Password123!"
     }
     ```

### Test Frontend

1. **Open browser:** Navigate to `http://localhost:5173`

2. **Test Registration:**
   - Click "إنشاء حساب جديد" (Create New Account)
   - Fill in the form
   - Submit and verify redirect

3. **Test Login:**
   - Use credentials from registration
   - Verify token storage in browser localStorage

4. **Test Features:**
   - Browse Workers (`/workers`)
   - Browse Jobs (`/worker/jobs`) - for workers
   - View Profile (`/profile`)
   - Create Service Request (if implemented)

## 🔧 Troubleshooting

### Backend Issues

**Problem:** `"expiresIn" should be a number of seconds or string`
- **Solution:** Make sure your `.env` file has `JWT_ACCESS_EXPIRES=1h` and `JWT_REFRESH_EXPIRES=7d`

**Problem:** `DB connection error`
- **Solution:** 
  - Check your MongoDB connection string in `.env`
  - Verify your IP is whitelisted in MongoDB Atlas
  - Check your database username and password

**Problem:** `Port 4000 already in use`
- **Solution:** Change `PORT` in `.env` to another port (e.g., `4001`)

### Frontend Issues

**Problem:** `Network Error` or `CORS Error`
- **Solution:** 
  - Make sure backend is running on port 4000
  - Check `VITE_API_URL` in frontend `.env` matches backend URL
  - Verify backend CORS is enabled (it should be)

**Problem:** `401 Unauthorized`
- **Solution:** 
  - Check if token is stored in localStorage
  - Try logging in again
  - Check browser console for errors

**Problem:** API calls not working
- **Solution:**
  - Open browser DevTools → Network tab
  - Check if requests are being sent
  - Verify backend is running and accessible

## 📝 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/getprofile` - Get current user profile
- `POST /api/auth/logout` - Logout

### Service Requests
- `POST /api/service-requests` - Create service request
- `GET /api/service-requests` - List service requests (with filters)
- `PUT /api/service-requests/:id/accept` - Accept service request (worker)
- `GET /api/service-requests/worker/:workerId/completed` - Get completed services for worker

### Workers
- `GET /api/workers` - List workers (with filters)
- `GET /api/workers/:workerId` - Get worker profile
- `PUT /api/workers/me` - Update/create worker profile

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user

### Reviews
- `POST /api/reviews` - Create/update review
- `GET /api/reviews/worker/:workerId` - Get worker reviews
- `DELETE /api/reviews/:reviewId` - Delete review

## 🎯 Next Steps

1. **Test all features** end-to-end
2. **Add more service request features** (create, update, delete)
3. **Implement real-time notifications** using Socket.IO (already set up in backend)
4. **Add file upload** for worker profile images and documents
5. **Implement messaging** between users and workers
6. **Add payment integration** (if needed)

## 📞 Support

If you encounter issues:
1. Check the console logs (both backend terminal and browser console)
2. Verify all environment variables are set correctly
3. Ensure MongoDB connection is working
4. Check that all dependencies are installed

## ✅ Checklist

- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created and connection string obtained
- [ ] IP address whitelisted in MongoDB Atlas
- [ ] Backend `.env` file created with all required variables
- [ ] Backend dependencies installed
- [ ] Backend server running on port 4000
- [ ] Frontend dependencies installed
- [ ] Frontend `.env` file created (optional)
- [ ] Frontend dev server running
- [ ] Tested registration and login
- [ ] Tested API endpoints with Postman

---

**Happy Coding! 🚀**

