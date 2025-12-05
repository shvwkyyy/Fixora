# Fixora API Reference

Complete API reference documentation for Fixora backend services.

## Base URL

```
Development: http://localhost:4000/api
Production: https://api.fixora.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <accessToken>
```

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP address
- **Response**: `429 Too Many Requests` when limit exceeded
- **Headers**: Rate limit information in response headers

---

## Authentication Endpoints

### Register User

Create a new user account.

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
    "type": "Point",
    "coordinates": [31.2, 30.0444]
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `409 Conflict` - Email already exists

---

### Login

Authenticate user and receive JWT tokens.

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

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing fields

---

### Refresh Token

Get new access token using refresh token.

```http
POST /api/auth/refresh
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid refresh token

---

### Get Profile

Get current authenticated user's profile.

```http
GET /api/auth/getprofile
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "01012345678",
    "city": "Cairo",
    "area": "Nasr City",
    "userType": "user",
    "profilePhoto": "https://example.com/photo.jpg",
    "location": {
      "type": "Point",
      "coordinates": [31.2, 30.0444]
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

### Logout

Logout user (client should delete tokens).

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### Get Current User

Get authenticated user information.

```http
GET /api/users/me
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "01012345678",
    "city": "Cairo",
    "area": "Nasr City",
    "userType": "user"
  }
}
```

---

### Update Current User

Update authenticated user information.

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
  "area": "Nasr City",
  "profilePhoto": "https://example.com/photo.jpg"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "01012345678",
    "city": "Cairo",
    "area": "Nasr City",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## Worker Endpoints

### List Workers

Get list of workers with optional filters.

```http
GET /api/workers
Query Parameters:
  - specialty: String (optional) - Filter by specialty
  - city: String (optional) - Filter by city
  - minPrice: Number (optional) - Minimum hourly price
  - maxPrice: Number (optional) - Maximum hourly price
  - verified: Boolean (optional) - Filter verified workers
  - page: Number (optional, default: 1)
  - limit: Number (optional, default: 20)
```

**Response:** `200 OK`
```json
{
  "workers": [
    {
      "id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "specialty": "Plumbing",
      "hourPrice": 100,
      "verificationStatus": "verified",
      "appliedJobsCount": 10,
      "completedJobsCount": 25,
      "rankScore": 95,
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "firstName": "Ahmed",
        "lastName": "Ali",
        "city": "Cairo",
        "area": "Nasr City",
        "profilePhoto": "https://example.com/photo.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

---

### Get Worker Profile

Get detailed worker profile including reviews.

```http
GET /api/workers/:workerId
```

**Response:** `200 OK`
```json
{
  "worker": {
    "id": "507f1f77bcf86cd799439012",
    "specialty": "Plumbing",
    "hourPrice": 100,
    "verificationStatus": "verified",
    "appliedJobsCount": 10,
    "completedJobsCount": 25,
    "rankScore": 95,
    "facebookAccount": "https://facebook.com/...",
    "tiktokAccount": "https://tiktok.com/...",
    "linkedinAccount": "https://linkedin.com/...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "email": "ahmed@example.com",
      "phone": "01012345678",
      "city": "Cairo",
      "area": "Nasr City",
      "profilePhoto": "https://example.com/photo.jpg"
    },
    "reviews": [
      {
        "id": "507f1f77bcf86cd799439013",
        "rating": 5,
        "comment": "Excellent work!",
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
}
```

---

### Create/Update Worker Profile

Create or update authenticated user's worker profile.

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
  "facebookAccount": "https://facebook.com/username",
  "tiktokAccount": "https://tiktok.com/@username",
  "linkedinAccount": "https://linkedin.com/in/username",
  "nationalIdFront": "base64_image_or_url",
  "nationalIdBack": "base64_image_or_url",
  "nationalIdWithFace": "base64_image_or_url"
}
```

**Response:** `200 OK` or `201 Created`
```json
{
  "worker": {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "specialty": "Plumbing",
    "hourPrice": 100,
    "verificationStatus": "pending",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## Service Request Endpoints

### Create Service Request

Create a new service request.

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

**Response:** `201 Created`
```json
{
  "serviceRequest": {
    "id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "problemDescription": "Need to fix a leaking pipe in the kitchen",
    "status": "pending",
    "assignedWorker": null,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### List Service Requests

Get list of service requests with optional filters.

```http
GET /api/service-requests
Authorization: Bearer <accessToken>
Query Parameters:
  - status: String (optional) - pending, accepted, rejected, in_progress, completed
  - specialty: String (optional)
  - page: Number (optional, default: 1)
  - limit: Number (optional, default: 20)
```

**Response:** `200 OK`
```json
{
  "serviceRequests": [
    {
      "id": "507f1f77bcf86cd799439014",
      "problemDescription": "Need to fix a leaking pipe",
      "status": "pending",
      "userId": "507f1f77bcf86cd799439011",
      "assignedWorker": null,
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "city": "Cairo",
        "area": "Nasr City"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

---

### Get Service Request by ID

Get detailed service request information.

```http
GET /api/service-requests/:id
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "serviceRequest": {
    "id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "problemDescription": "Need to fix a leaking pipe in the kitchen",
    "status": "pending",
    "assignedWorker": null,
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "city": "Cairo",
      "area": "Nasr City"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### Accept Service Request

Accept a service request (worker action).

```http
PUT /api/service-requests/:id/accept
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "serviceRequest": {
    "id": "507f1f77bcf86cd799439014",
    "status": "accepted",
    "assignedWorker": "507f1f77bcf86cd799439012",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### Get Completed Services for Worker

Get all completed services for a specific worker.

```http
GET /api/service-requests/worker/:workerId/completed
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "completedServices": [
    {
      "id": "507f1f77bcf86cd799439014",
      "problemDescription": "Fixed leaking pipe",
      "status": "completed",
      "userId": "507f1f77bcf86cd799439011",
      "user": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "completedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## Message Endpoints

### Send Message

Send a message to another user.

```http
POST /api/messages
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "receiverId": "507f1f77bcf86cd799439015",
  "contentText": "Hello, are you available?",
  "contentImage": null
}
```

**Response:** `201 Created`
```json
{
  "message": {
    "id": "507f1f77bcf86cd799439016",
    "conversationId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439015",
    "senderId": "507f1f77bcf86cd799439011",
    "receiverId": "507f1f77bcf86cd799439015",
    "contentText": "Hello, are you available?",
    "contentImage": null,
    "isRead": false,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### Get Conversations

Get all conversations for authenticated user.

```http
GET /api/messages/conversations
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "conversations": [
    {
      "otherUser": {
        "id": "507f1f77bcf86cd799439015",
        "firstName": "Ahmed",
        "lastName": "Ali",
        "profilePhoto": "https://example.com/photo.jpg"
      },
      "lastMessage": {
        "contentText": "Hello",
        "createdAt": "2024-01-15T10:00:00.000Z"
      },
      "unreadCount": 2,
      "conversationId": "507f1f77bcf86cd799439011_507f1f77bcf86cd799439015"
    }
  ]
}
```

---

### Get Conversation Messages

Get messages from a specific conversation.

```http
GET /api/messages/conversation/:otherUserId
Authorization: Bearer <accessToken>
Query Parameters:
  - page: Number (optional, default: 1)
  - limit: Number (optional, default: 50)
```

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": "507f1f77bcf86cd799439016",
      "senderId": "507f1f77bcf86cd799439011",
      "receiverId": "507f1f77bcf86cd799439015",
      "contentText": "Hello",
      "contentImage": null,
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

## Review Endpoints

### Get Worker Reviews

Get all reviews for a specific worker.

```http
GET /api/reviews/worker/:workerId
```

**Response:** `200 OK`
```json
{
  "reviews": [
    {
      "id": "507f1f77bcf86cd799439017",
      "rating": 5,
      "comment": "Excellent work! Very professional.",
      "userId": "507f1f77bcf86cd799439011",
      "workerId": "507f1f77bcf86cd799439012",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "profilePhoto": "https://example.com/photo.jpg"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 25
}
```

---

### Create Review

Create or update a review for a worker.

```http
POST /api/reviews
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "workerId": "507f1f77bcf86cd799439012",
  "rating": 5,
  "comment": "Excellent work! Very professional."
}
```

**Response:** `201 Created` or `200 OK`
```json
{
  "review": {
    "id": "507f1f77bcf86cd799439017",
    "userId": "507f1f77bcf86cd799439011",
    "workerId": "507f1f77bcf86cd799439012",
    "rating": 5,
    "comment": "Excellent work! Very professional.",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### Delete Review

Delete a review (only by review owner).

```http
DELETE /api/reviews/:reviewId
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Notification Endpoints

### Get Notifications

Get all notifications for authenticated user.

```http
GET /api/notifications
Authorization: Bearer <accessToken>
Query Parameters:
  - isRead: Boolean (optional)
  - page: Number (optional, default: 1)
  - limit: Number (optional, default: 20)
```

**Response:** `200 OK`
```json
{
  "notifications": [
    {
      "id": "507f1f77bcf86cd799439018",
      "notificationContent": "You have a new message",
      "type": "message",
      "isRead": false,
      "senderId": "507f1f77bcf86cd799439015",
      "sender": {
        "firstName": "Ahmed",
        "lastName": "Ali"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "unreadCount": 5,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

---

### Mark Notification as Read

Mark a notification as read.

```http
POST /api/notifications/mark-read
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "notificationId": "507f1f77bcf86cd799439018"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "field": "error message"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "Conflict",
  "message": "Resource already exists"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Error message"
}
```

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

**Last Updated**: January 2024

