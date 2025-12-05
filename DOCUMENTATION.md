# Fixora - Complete Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Technology Stack](#technology-stack)
5. [Setup & Installation](#setup--installation)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Socket.IO Events](#socketio-events)
9. [Frontend Structure](#frontend-structure)
10. [Features](#features)
11. [Security](#security)
12. [Deployment](#deployment)
13. [Testing](#testing)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Fixora** is a service marketplace platform that connects users with service providers (workers) in various categories such as plumbing, electricity, cleaning, painting, and more. The platform enables users to post service requests and allows workers to find and apply for jobs matching their specialties.

### Key Features

- **User Authentication** - Secure registration and login with JWT tokens
- **Service Requests** - Users can create and manage service requests
- **Worker Profiles** - Workers can create profiles with specialties and portfolios
- **Real-time Messaging** - Socket.IO-based messaging system
- **Reviews & Ratings** - Users can review and rate workers
- **Location-based Matching** - GeoJSON-based location services
- **Worker Verification** - National ID verification system
- **Notifications** - Real-time notifications for various events
- **AI Chatbot** - Integrated chatbot for customer support

### User Types

- **User/Client** - Can create service requests, browse workers, and leave reviews
- **Worker** - Can browse jobs, apply for services, and manage profile
- **Admin** - Platform administrators (future implementation)

---

## Architecture

Fixora follows a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  - User Interface                                            │
│  - Client-side Routing                                       │
│  - Socket.IO Client                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST API + Socket.IO
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│  - REST API Endpoints                                        │
│  - Socket.IO Server                                          │
│  - JWT Authentication                                        │
│  - Business Logic                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Mongoose ODM
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Database (MongoDB Atlas)                        │
│  - User Data                                                 │
│  - Service Requests                                          │
│  - Messages                                                  │
│  - Reviews                                                   │
└─────────────────────────────────────────────────────────────┘
```

### Components

1. **Frontend** (`/frontend`)
   - React 19.2.0
   - Vite build tool
   - React Router for navigation
   - Socket.IO client for real-time features

2. **Backend** (`/Backend`)
   - Express.js server
   - MongoDB with Mongoose
   - Socket.IO server
   - JWT authentication

3. **Chatbot** (`/Chatbot`)
   - Separate React component
   - Google GenAI integration
   - TypeScript support

---

## Project Structure

```
Fixora/
├── Backend/                      # Backend server
│   ├── src/
│   │   ├── app.js               # Express app configuration
│   │   ├── server.js            # Server entry point
│   │   ├── config/
│   │   │   └── db.js            # MongoDB connection
│   │   ├── controllers/         # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── message.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── review.controller.js
│   │   │   ├── ServiceRequest.controller.js
│   │   │   ├── user.controller.js
│   │   │   └── worker.controller.js
│   │   ├── middleware/          # Custom middleware
│   │   │   ├── jwtMiddleware.js
│   │   │   └── socketAuth.js
│   │   ├── models/              # Mongoose models
│   │   │   ├── user.model.js
│   │   │   ├── WorkerProfile.model.js
│   │   │   ├── ServiceRequest.model.js
│   │   │   ├── Message.model.js
│   │   │   ├── Review.models.js
│   │   │   ├── Notification.models.js
│   │   │   ├── PortfolioItems.model.js
│   │   │   ├── SocialMediaUrls.model.js
│   │   │   ├── Report.model.js
│   │   │   └── ChatbotContent.model.js
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── worker.routes.js
│   │   │   ├── ServiceRequest.routes.js
│   │   │   ├── message.routes.js
│   │   │   ├── review.routes.js
│   │   │   └── notification.routes.js
│   │   ├── sockets/             # Socket.IO handlers
│   │   │   └── sockets.js
│   │   └── utils/               # Utility functions
│   │       └── jwt.js
│   ├── tests/
│   │   └── Fixora.postman_collection.json
│   ├── package.json
│   └── .env                     # Environment variables (create this)
│
├── frontend/                     # Frontend application
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   ├── Components/          # Reusable components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Body/
│   │   │   └── Chatbot/
│   │   ├── pages/               # Page components
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Profile/
│   │   │   ├── WorkerRegister/
│   │   │   ├── WorkerDashboard/
│   │   │   ├── BrowseJobs/
│   │   │   ├── BrowseWorkers/
│   │   │   ├── WorkerProfile/
│   │   │   ├── MyJobs/
│   │   │   ├── Messages/
│   │   │   ├── CreateServiceRequest/
│   │   │   └── ServiceRequestDetails/
│   │   └── utils/               # Utility functions
│   │       ├── api.js           # API client
│   │       └── dummyData.js
│   ├── package.json
│   └── vite.config.js
│
├── Chatbot/                      # Chatbot component
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
├── SETUP_GUIDE.md
├── DOCUMENTATION.md             # This file
└── Fixora_Documentation.pdf
```

---

## Technology Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 9.0.0
- **Authentication**: JWT (jsonwebtoken 9.0.0)
- **Real-time**: Socket.IO 4.8.1
- **Validation**: Validator.js 13.15.23
- **Security**: bcryptjs 3.0.3, express-rate-limit 8.2.1
- **OAuth**: Passport.js with Facebook and Google strategies

### Frontend

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.9.6
- **HTTP Client**: Axios 1.13.2
- **Real-time**: Socket.IO Client 4.8.1
- **Icons**: React Icons 5.5.0
- **AI**: Google GenAI 1.30.0

### Database

- **MongoDB Atlas** (Cloud) or local MongoDB
- **Mongoose ODM** for schema modeling

---

## Setup & Installation

### Prerequisites

- Node.js (v16 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)
- MongoDB Atlas Account (or local MongoDB installation)
- Git (optional)

### Backend Setup

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

4. **Start the backend server:**
   ```bash
   node src/server.js
   ```

   You should see:
   ```
   connected to DB
   server is running on port 4000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
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

   The frontend will be available at `http://localhost:5173`

### MongoDB Atlas Setup

1. **Create a MongoDB Atlas account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a new cluster** (free tier is fine)

3. **Get your connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `fixora`

4. **Whitelist your IP address:**
   - Go to "Network Access" in Atlas
   - Click "Add IP Address"
   - Click "Add Current IP Address"

5. **Create a database user:**
   - Go to "Database Access" in Atlas
   - Click "Add New Database User"
   - Create a user with username and password

### Chatbot Setup

1. **Navigate to Chatbot directory:**
   ```bash
   cd Fixora/Chatbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the chatbot (if separate):**
   ```bash
   npm run dev
   ```

---

## Database Schema

### User Model

```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique, lowercase, validated),
  password: String (required, minlength: 8, hashed),
  phone: String (required, Egyptian format validation),
  optionalPhone: String (default: ""),
  profilePhoto: String (default: ""),
  city: String (required),
  area: String (required),
  userType: Enum ["user", "worker", "admin"] (default: "user"),
  location: {
    type: "Point",
    coordinates: [longitude, latitude] (default: [0, 0])
  },
  timestamps: true
}
```

**Indexes:**
- `location: "2dsphere"` - For geospatial queries
- `userType: 1` - For filtering by user type

### Worker Profile Model

```javascript
{
  userId: ObjectId (required, unique, ref: "User"),
  specialty: String (required),
  rankScore: Number (default: 0),
  appliedJobsCount: Number (default: 0),
  completedJobsCount: Number (default: 0),
  hourPrice: Number (required),
  verificationStatus: Enum ["pending", "verified", "rejected"] (default: "pending"),
  facebookAccount: String,
  tiktokAccount: String,
  linkedinAccount: String,
  nationalIdFront: String,
  nationalIdBack: String,
  nationalIdWithFace: String,
  timestamps: true
}
```

**Indexes:**
- `specialty: 1` - For filtering by specialty
- `verificationStatus: 1` - For filtering verified workers

### Service Request Model

```javascript
{
  userId: ObjectId (required, ref: "User"),
  assignedWorker: ObjectId (default: null, ref: "Worker"),
  problemDescription: String (required),
  status: Enum ["pending", "accepted", "rejected", "in_progress", "completed"] (default: "pending"),
  timestamps: true
}
```

**Indexes:**
- `userId: 1, status: 1` - For user's jobs filtering
- `assignedWorker: 1, status: 1` - For worker's jobs filtering
- `createdAt: -1` - For chronological sorting

### Message Model

```javascript
{
  conversationId: String (required, indexed),
  senderId: ObjectId (required, ref: "User", indexed),
  receiverId: ObjectId (required, ref: "User", indexed),
  contentText: String (default: null),
  contentImage: String (default: null),
  isRead: Boolean (default: false),
  timestamps: true
}
```

**Indexes:**
- `conversationId: 1, createdAt: -1` - For conversation messages
- `receiverId: 1, isRead: 1` - For unread messages
- `senderId: 1, receiverId: 1` - For user pair queries
- `createdAt: -1` - For chronological sorting

### Review Model

```javascript
{
  userId: ObjectId (required, ref: "User"),
  workerId: ObjectId (required, ref: "Worker"),
  rating: Number (required, min: 1, max: 5),
  comment: String,
  timestamps: true
}
```

**Indexes:**
- `userId: 1` - For user's reviews
- `workerId: 1` - For worker's reviews
- `rating: 1` - For rating-based queries

### Notification Model

```javascript
{
  userId: ObjectId (required, ref: "User"),
  senderId: ObjectId (ref: "User"),
  notificationContent: String (required),
  type: String,
  isRead: Boolean (default: false),
  timestamps: true
}
```

**Indexes:**
- `userId: 1, isRead: 1` - For user's unread notifications
- `createdAt: -1` - For chronological sorting

### Additional Models

- **PortfolioItems** - Worker portfolio items
- **SocialMediaUrls** - Worker social media links
- **Report** - User/worker reports
- **ChatbotContent** - Chatbot content management

---

## API Documentation

### Base URL

```
http://localhost:4000/api
```

### Authentication

All protected routes require JWT token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

### Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Response**: 429 Too Many Requests

---

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phone": "01012345678",
  "city": "Cairo",
  "area": "Nasr City",
  "userType": "user",
  "location": {
    "coordinates": [31.2, 30.0444]
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "user"
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "john@example.com",
    "userType": "user"
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### Get Profile

```http
GET /api/auth/getprofile
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "01012345678",
    "city": "Cairo",
    "area": "Nasr City",
    "userType": "user",
    "location": {
      "type": "Point",
      "coordinates": [31.2, 30.0444]
    }
  }
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### User Endpoints

#### Get Current User

```http
GET /api/users/me
Authorization: Bearer <accessToken>
```

#### Update Current User

```http
PUT /api/users/me
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "01012345678",
  "city": "Cairo",
  "area": "Nasr City"
}
```

---

### Worker Endpoints

#### List Workers

```http
GET /api/workers
Query Parameters:
  - specialty: String (optional)
  - city: String (optional)
  - minPrice: Number (optional)
  - maxPrice: Number (optional)
  - verified: Boolean (optional)
```

**Response (200 OK):**
```json
{
  "workers": [
    {
      "id": "...",
      "userId": "...",
      "specialty": "Plumbing",
      "hourPrice": 100,
      "verificationStatus": "verified",
      "completedJobsCount": 25,
      "user": {
        "firstName": "Ahmed",
        "lastName": "Ali",
        "city": "Cairo",
        "area": "Nasr City"
      }
    }
  ]
}
```

#### Get Worker Profile

```http
GET /api/workers/:workerId
```

**Response (200 OK):**
```json
{
  "worker": {
    "id": "...",
    "specialty": "Plumbing",
    "hourPrice": 100,
    "verificationStatus": "verified",
    "appliedJobsCount": 10,
    "completedJobsCount": 25,
    "user": {
      "firstName": "Ahmed",
      "lastName": "Ali",
      "email": "ahmed@example.com",
      "phone": "01012345678"
    },
    "reviews": [
      {
        "rating": 5,
        "comment": "Excellent work!",
        "user": {
          "firstName": "John"
        }
      }
    ]
  }
}
```

#### Create/Update Worker Profile

```http
PUT /api/workers/me
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "specialty": "Plumbing",
  "hourPrice": 100,
  "facebookAccount": "https://facebook.com/...",
  "tiktokAccount": "https://tiktok.com/...",
  "linkedinAccount": "https://linkedin.com/...",
  "nationalIdFront": "base64_image_or_url",
  "nationalIdBack": "base64_image_or_url",
  "nationalIdWithFace": "base64_image_or_url"
}
```

---

### Service Request Endpoints

#### Create Service Request

```http
POST /api/service-requests
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "problemDescription": "Need to fix a leaking pipe in the kitchen",
  "specialty": "Plumbing"
}
```

**Response (201 Created):**
```json
{
  "serviceRequest": {
    "id": "...",
    "userId": "...",
    "problemDescription": "Need to fix a leaking pipe in the kitchen",
    "status": "pending",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### List Service Requests

```http
GET /api/service-requests
Authorization: Bearer <accessToken>
Query Parameters:
  - status: String (optional) - pending, accepted, rejected, in_progress, completed
  - specialty: String (optional)
```

**Response (200 OK):**
```json
{
  "serviceRequests": [
    {
      "id": "...",
      "problemDescription": "...",
      "status": "pending",
      "userId": "...",
      "user": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

#### Get Service Request by ID

```http
GET /api/service-requests/:id
Authorization: Bearer <accessToken>
```

#### Accept Service Request (Worker)

```http
PUT /api/service-requests/:id/accept
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "serviceRequest": {
    "id": "...",
    "status": "accepted",
    "assignedWorker": "..."
  }
}
```

#### Get Completed Services for Worker

```http
GET /api/service-requests/worker/:workerId/completed
Authorization: Bearer <accessToken>
```

---

### Message Endpoints

#### Send Message

```http
POST /api/messages
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "receiverId": "...",
  "contentText": "Hello, are you available?",
  "contentImage": null
}
```

**Response (201 Created):**
```json
{
  "message": {
    "id": "...",
    "conversationId": "...",
    "senderId": "...",
    "receiverId": "...",
    "contentText": "Hello, are you available?",
    "isRead": false,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Get Conversations

```http
GET /api/messages/conversations
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "conversations": [
    {
      "otherUser": {
        "id": "...",
        "firstName": "John",
        "lastName": "Doe"
      },
      "lastMessage": {
        "contentText": "Hello",
        "createdAt": "2024-01-15T10:00:00.000Z"
      },
      "unreadCount": 2
    }
  ]
}
```

#### Get Conversation Messages

```http
GET /api/messages/conversation/:otherUserId
Authorization: Bearer <accessToken>
Query Parameters:
  - page: Number (optional, default: 1)
  - limit: Number (optional, default: 50)
```

**Response (200 OK):**
```json
{
  "messages": [
    {
      "id": "...",
      "senderId": "...",
      "receiverId": "...",
      "contentText": "Hello",
      "isRead": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100
  }
}
```

---

### Review Endpoints

#### Get Worker Reviews

```http
GET /api/reviews/worker/:workerId
```

**Response (200 OK):**
```json
{
  "reviews": [
    {
      "id": "...",
      "rating": 5,
      "comment": "Excellent work!",
      "userId": "...",
      "user": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 25
}
```

#### Create Review

```http
POST /api/reviews
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "workerId": "...",
  "rating": 5,
  "comment": "Excellent work! Very professional."
}
```

**Response (201 Created):**
```json
{
  "review": {
    "id": "...",
    "workerId": "...",
    "rating": 5,
    "comment": "Excellent work! Very professional.",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Delete Review

```http
DELETE /api/reviews/:reviewId
Authorization: Bearer <accessToken>
```

---

### Notification Endpoints

#### Get Notifications

```http
GET /api/notifications
Authorization: Bearer <accessToken>
Query Parameters:
  - isRead: Boolean (optional)
  - page: Number (optional, default: 1)
  - limit: Number (optional, default: 20)
```

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "id": "...",
      "notificationContent": "You have a new message",
      "type": "message",
      "isRead": false,
      "senderId": "...",
      "sender": {
        "firstName": "John"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "unreadCount": 5
}
```

#### Mark Notification as Read

```http
POST /api/notifications/mark-read
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "notificationId": "..."
}
```

---

## Socket.IO Events

### Connection

All Socket.IO connections require authentication. The client must send the JWT token during connection:

```javascript
const socket = io("http://localhost:4000", {
  auth: {
    token: accessToken
  }
});
```

### Client → Server Events

#### Send Message

```javascript
socket.emit("message:send", {
  receiverId: "user_id",
  contentText: "Hello",
  contentImage: null // optional
}, (ack) => {
  if (ack.ok) {
    console.log("Message sent:", ack.message);
  } else {
    console.error("Error:", ack.error);
  }
});
```

#### Typing Indicator

```javascript
socket.emit("typing", {
  receiverId: "user_id",
  typing: true,
  conversationId: "conversation_id" // optional
});
```

### Server → Client Events

#### New Message

```javascript
socket.on("message:new", (message) => {
  console.log("New message:", message);
  // message: {
  //   id, conversationId, senderId, receiverId,
  //   contentText, contentImage, isRead, createdAt
  // }
});
```

#### Typing Indicator

```javascript
socket.on("typing", (data) => {
  // data: {
  //   fromUserId: "...",
  //   typing: true/false,
  //   conversationId: "..."
  // }
});
```

### Socket Rooms

Users are automatically joined to:
- `user:{userId}` - Personal room for direct messages
- `worker:{userId}` - Worker-specific room (if userType is "worker")
- `specialty:{specialty}` - Room for workers with specific specialty

### Presence Management

The server maintains a presence map to track online users. Use the `isUserOnline()` function to check user status.

---

## Frontend Structure

### Routing

The frontend uses React Router DOM for navigation:

```javascript
/ - Home page
/login - Login page
/register - Registration page
/profile - User profile page
/worker/register - Worker registration
/worker/dashboard - Worker dashboard
/worker/jobs - Browse available jobs (worker)
/worker/:id - Worker profile page
/jobs - My jobs (user)
/jobs/create - Create service request
/jobs/:id/details - Service request details
/workers - Browse workers
/messages - Messages/Inbox
```

### Components

#### Layout Components

- **Header** - Navigation bar with user menu
- **Footer** - Footer with links and information
- **Chatbot** - AI chatbot component

#### Page Components

- **Body** - Home page with service categories
- **Login** - User authentication
- **Register** - User registration
- **Profile** - User profile management
- **WorkerRegister** - Worker profile creation
- **WorkerDashboard** - Worker's job management
- **BrowseJobs** - Available jobs for workers
- **BrowseWorkers** - Browse and filter workers
- **WorkerProfile** - Detailed worker profile view
- **MyJobs** - User's service requests
- **CreateServiceRequest** - Create new service request
- **ServiceRequestDetails** - Service request details and management
- **Messages** - Messaging interface

### API Client

The frontend uses an API client utility (`utils/api.js`) that handles:
- Base URL configuration
- Token management
- Request/response interceptors
- Error handling

### State Management

Currently uses React's built-in state management. Consider adding:
- Context API for global state
- Redux or Zustand for complex state
- React Query for server state

---

## Features

### User Features

1. **Registration & Authentication**
   - Email/password registration
   - JWT-based authentication
   - Refresh token support
   - Password hashing with bcrypt

2. **Service Request Management**
   - Create service requests
   - View all service requests
   - Track request status
   - Accept/reject worker applications

3. **Worker Browsing**
   - Browse workers by specialty
   - Filter by location, price, rating
   - View worker profiles
   - View worker portfolios

4. **Messaging**
   - Real-time messaging with workers
   - Conversation management
   - Typing indicators
   - Message read status

5. **Reviews & Ratings**
   - Leave reviews for workers
   - Rate workers (1-5 stars)
   - View worker reviews
   - Edit/delete own reviews

### Worker Features

1. **Profile Management**
   - Create worker profile
   - Set specialty and hourly rate
   - Upload portfolio items
   - Add social media links
   - National ID verification

2. **Job Management**
   - Browse available jobs
   - Filter by specialty and location
   - Apply for jobs
   - Track job status
   - View completed jobs

3. **Dashboard**
   - View statistics
   - Active jobs
   - Earnings summary
   - Profile completion status

4. **Verification**
   - Upload National ID documents
   - Verification status tracking
   - Portfolio showcase

### Platform Features

1. **Real-time Updates**
   - Socket.IO for real-time messaging
   - Live notifications
   - Presence indicators
   - Typing indicators

2. **Location Services**
   - GeoJSON-based location storage
   - Geospatial queries
   - Distance calculations
   - Location-based matching

3. **AI Chatbot**
   - Google GenAI integration
   - Customer support
   - FAQ handling

4. **Notifications**
   - Real-time notifications
   - Notification history
   - Read/unread status
   - Multiple notification types

---

## Security

### Authentication & Authorization

- **JWT Tokens**: Access tokens (1h expiry) and refresh tokens (7d expiry)
- **Password Hashing**: bcrypt with salt rounds
- **Token Refresh**: Automatic token refresh mechanism
- **Protected Routes**: JWT middleware for API protection

### API Security

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Validator.js for email, phone validation
- **SQL Injection Protection**: Mongoose ODM prevents NoSQL injection

### Socket.IO Security

- **Authentication Middleware**: JWT verification for socket connections
- **Room Isolation**: Users can only join their own rooms
- **Presence Management**: Secure presence tracking

### Best Practices

- Never commit `.env` files
- Use strong JWT secrets
- Validate all user inputs
- Use HTTPS in production
- Implement proper error handling
- Sanitize user inputs
- Regular security audits

---

## Deployment

### Environment Variables

#### Backend `.env`

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fixora?retryWrites=true&w=majority
PORT=4000
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d
NODE_ENV=production
```

#### Frontend `.env`

```env
VITE_API_URL=https://api.fixora.com
VITE_SOCKET_URL=https://api.fixora.com
```

### Backend Deployment

1. **Build**: No build step required for Node.js
2. **Start Command**: `node src/server.js`
3. **Process Manager**: Use PM2 for production
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name fixora-backend
   ```

### Frontend Deployment

1. **Build**:
   ```bash
   npm run build
   ```
2. **Output**: `dist/` directory
3. **Deploy**: Serve static files using Nginx, Vercel, Netlify, etc.

### MongoDB Atlas

- Use MongoDB Atlas for production
- Configure IP whitelist
- Enable backup
- Monitor performance

### Recommendations

- Use environment-specific configurations
- Enable logging
- Set up monitoring (e.g., Sentry)
- Configure SSL/TLS certificates
- Use CDN for static assets
- Set up CI/CD pipeline

---

## Testing

### Backend Testing

Postman collection is available at:
```
Backend/tests/Fixora.postman_collection.json
```

### Testing Checklist

- [ ] User registration
- [ ] User login
- [ ] Token refresh
- [ ] Create service request
- [ ] List service requests
- [ ] Worker profile creation
- [ ] Browse workers
- [ ] Send message
- [ ] Create review
- [ ] Socket.IO connection
- [ ] Real-time messaging

### Manual Testing

1. **Authentication Flow**
   - Register new user
   - Login
   - Access protected routes
   - Token refresh

2. **Service Request Flow**
   - Create service request
   - View service requests
   - Accept service request (worker)

3. **Messaging Flow**
   - Send message
   - Receive message
   - View conversations

4. **Worker Flow**
   - Create worker profile
   - Browse jobs
   - Apply for job

---

## Troubleshooting

### Common Issues

#### Backend Issues

**Problem:** `"expiresIn" should be a number of seconds or string`
- **Solution:** Ensure `.env` has `JWT_ACCESS_EXPIRES=1h` and `JWT_REFRESH_EXPIRES=7d`

**Problem:** `DB connection error`
- **Solution:**
  - Check MongoDB connection string in `.env`
  - Verify IP is whitelisted in MongoDB Atlas
  - Check database username and password

**Problem:** `Port 4000 already in use`
- **Solution:** Change `PORT` in `.env` to another port (e.g., `4001`)

#### Frontend Issues

**Problem:** `Network Error` or `CORS Error`
- **Solution:**
  - Ensure backend is running on port 4000
  - Check `VITE_API_URL` in frontend `.env`
  - Verify backend CORS is enabled

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

#### Socket.IO Issues

**Problem:** Socket connection fails
- **Solution:**
  - Check authentication token is valid
  - Verify Socket.IO server is running
  - Check CORS configuration

**Problem:** Messages not received
- **Solution:**
  - Verify user is in correct Socket.IO room
  - Check Socket.IO event names match
  - Verify authentication middleware

### Debug Mode

Enable debug logs:

```javascript
// Backend
console.log("Debug info:", data);

// Frontend
console.log("Debug info:", data);
```

### Getting Help

1. Check console logs (backend terminal and browser console)
2. Verify all environment variables are set correctly
3. Ensure MongoDB connection is working
4. Check that all dependencies are installed
5. Review API endpoint documentation
6. Check Socket.IO connection status

---

## Contributing

### Code Style

- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Maintain consistent formatting

### Git Workflow

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create pull request

### Testing Requirements

- Test all new features
- Update documentation
- Test edge cases
- Check for errors

---

## Contact & Support

[Add contact information here]

---

**Last Updated**: January 2024

**Version**: 1.0.0

---

