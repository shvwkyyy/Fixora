# Fixora Architecture Documentation

## System Architecture

Fixora follows a modern three-tier architecture pattern with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │  Mobile App  │  │   Admin      │          │
│  │  (React SPA) │  │  (Future)    │  │   Panel      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          │ HTTP/REST        │                  │
          │ Socket.IO        │                  │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼──────────────────┐
│                      Application Layer                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Express.js REST API Server                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │   Routes     │  │ Controllers  │  │  Middleware  │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Socket.IO Real-time Server                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │   Events     │  │   Rooms      │  │   Presence   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Authentication & Authorization                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │     JWT      │  │    bcrypt    │  │   Passport   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             │ Mongoose ODM
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                        Data Layer                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MongoDB Atlas (Cloud)                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │   Users      │  │   Workers    │  │   Messages   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │   Requests   │  │   Reviews    │  │Notifications │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Architecture

```
Frontend Application
│
├── Components (Reusable UI Components)
│   ├── Header - Navigation bar
│   ├── Footer - Footer section
│   ├── Body - Home page content
│   └── Chatbot - AI chatbot component
│
├── Pages (Route Components)
│   ├── Authentication
│   │   ├── Login
│   │   └── Register
│   ├── User Pages
│   │   ├── Profile
│   │   ├── MyJobs
│   │   ├── CreateServiceRequest
│   │   ├── ServiceRequestDetails
│   │   ├── BrowseWorkers
│   │   └── Messages
│   └── Worker Pages
│       ├── WorkerRegister
│       ├── WorkerDashboard
│       ├── BrowseJobs
│       └── WorkerProfile
│
├── Utils (Utilities)
│   ├── api.js - API client with interceptors
│   └── dummyData.js - Mock data for development
│
└── State Management
    ├── React Context (Global state)
    ├── Local State (Component state)
    └── URL State (Route parameters)
```

### Backend Architecture

```
Backend Application
│
├── Entry Point
│   └── server.js - HTTP server initialization
│
├── Application Core
│   └── app.js - Express app configuration
│
├── Routes (API Endpoints)
│   ├── auth.routes.js - Authentication endpoints
│   ├── user.routes.js - User management
│   ├── worker.routes.js - Worker management
│   ├── ServiceRequest.routes.js - Service requests
│   ├── message.routes.js - Messaging
│   ├── review.routes.js - Reviews & ratings
│   └── notification.routes.js - Notifications
│
├── Controllers (Business Logic)
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── worker.controller.js
│   ├── ServiceRequest.controller.js
│   ├── message.controller.js
│   ├── review.controller.js
│   └── notification.controller.js
│
├── Models (Data Models)
│   ├── user.model.js
│   ├── WorkerProfile.model.js
│   ├── ServiceRequest.model.js
│   ├── Message.model.js
│   ├── Review.models.js
│   ├── Notification.models.js
│   └── Supporting models...
│
├── Middleware (Request Processing)
│   ├── jwtMiddleware.js - JWT authentication
│   └── socketAuth.js - Socket.IO authentication
│
├── Sockets (Real-time Communication)
│   └── sockets.js - Socket.IO event handlers
│
├── Config (Configuration)
│   └── db.js - MongoDB connection
│
└── Utils (Utilities)
    └── jwt.js - JWT token utilities
```

## Data Flow

### Authentication Flow

```
1. User submits login credentials
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT tokens (access + refresh)
   ↓
5. Frontend stores tokens in localStorage
   ↓
6. Frontend includes accessToken in subsequent requests
   ↓
7. Backend validates token on each request
   ↓
8. If token expired, frontend uses refreshToken to get new accessToken
```

### Service Request Flow

```
1. User creates service request
   ↓
2. Frontend sends POST /api/service-requests
   ↓
3. Backend creates ServiceRequest document
   ↓
4. Backend emits Socket.IO event to workers with matching specialty
   ↓
5. Workers receive notification in real-time
   ↓
6. Worker applies for job
   ↓
7. Backend updates ServiceRequest with application
   ↓
8. Backend sends notification to user via Socket.IO
   ↓
9. User accepts worker application
   ↓
10. Backend updates ServiceRequest status to "accepted"
    ↓
11. Both parties receive confirmation notifications
```

### Messaging Flow

```
1. User A sends message to User B
   ↓
2. Frontend emits Socket.IO "message:send" event
   ↓
3. Backend receives event and authenticates
   ↓
4. Backend saves message to database
   ↓
5. Backend emits "message:new" to both users
   ↓
6. If User B is online, receives real-time notification
   ↓
7. If User B is offline, message stored for later retrieval
   ↓
8. User B opens conversation
   ↓
9. Frontend fetches message history via GET /api/messages/conversation/:userId
   ↓
10. Backend returns paginated message history
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│ 1. Network Layer                                         │
│    - HTTPS/TLS encryption                                │
│    - CORS configuration                                  │
│                                                           │
│ 2. Application Layer                                     │
│    - Rate limiting (100 req/15min)                       │
│    - Input validation                                    │
│    - SQL/NoSQL injection prevention                      │
│                                                           │
│ 3. Authentication Layer                                  │
│    - JWT token-based authentication                      │
│    - Token expiration (1h access, 7d refresh)            │
│    - Password hashing (bcrypt)                           │
│                                                           │
│ 4. Authorization Layer                                   │
│    - Role-based access control (user/worker/admin)       │
│    - Resource ownership validation                       │
│                                                           │
│ 5. Socket.IO Security                                    │
│    - JWT authentication on connection                    │
│    - Room-based isolation                                │
│    - Event authorization                                 │
└─────────────────────────────────────────────────────────┘
```

### Data Protection

- **Passwords**: Hashed using bcrypt with salt rounds
- **Tokens**: Signed with secret key, short expiration times
- **Database**: MongoDB with connection string authentication
- **Input**: Validated and sanitized before processing
- **Output**: Sensitive data excluded from responses

## Real-time Architecture

### Socket.IO Structure

```
Socket.IO Server
│
├── Connection Management
│   ├── Authentication middleware
│   ├── User identification
│   └── Room assignment
│
├── Room System
│   ├── user:{userId} - Personal room for each user
│   ├── worker:{userId} - Worker-specific room
│   └── specialty:{specialty} - Specialty-based room
│
├── Presence System
│   ├── Online user tracking
│   ├── Connection/disconnection events
│   └── Status management
│
└── Event Handlers
    ├── message:send - Send message
    ├── message:new - Receive message (broadcast)
    ├── typing - Typing indicators
    └── Custom events for future features
```

### Event Flow

```
Client A                    Server                      Client B
   │                           │                           │
   │─── message:send ─────────►│                           │
   │                           │─── Save to DB            │
   │                           │─── emit message:new ────►│
   │                           │                           │
   │◄── ack ───────────────────│                           │
   │                           │                           │
```

## Database Architecture

### Schema Relationships

```
User (1) ──────┬─────── (1) WorkerProfile
                │
                │ (1)
                │
                ▼
        ServiceRequest (N)
                │
                │ (N)
                │
                ▼
        Review (N) ────────► WorkerProfile (1)
                │
                │ (N)
                │
                ▼
            Message (N) ────► User (1)
                │
                │ (N)
                │
                ▼
        Notification (N) ───► User (1)
```

### Indexing Strategy

- **User Collection**
  - `location: "2dsphere"` - Geospatial queries
  - `userType: 1` - User type filtering
  - `email: 1` (unique) - Login queries

- **ServiceRequest Collection**
  - `userId: 1, status: 1` - User's jobs
  - `assignedWorker: 1, status: 1` - Worker's jobs
  - `createdAt: -1` - Chronological sorting

- **Message Collection**
  - `conversationId: 1, createdAt: -1` - Conversation messages
  - `receiverId: 1, isRead: 1` - Unread messages
  - `senderId: 1, receiverId: 1` - User pair queries

- **WorkerProfile Collection**
  - `specialty: 1` - Specialty filtering
  - `verificationStatus: 1` - Verification filtering
  - `userId: 1` (unique) - User lookup

## Scalability Considerations

### Horizontal Scaling

- **Stateless API**: All servers can handle any request
- **MongoDB Replica Set**: Read scaling with multiple nodes
- **Load Balancing**: Distribute requests across servers
- **Socket.IO Scaling**: Use Redis adapter for multi-server

### Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis for frequently accessed data
- **CDN**: Static assets delivery
- **Database Connection Pooling**: Efficient connection management
- **Pagination**: Limit data transfer per request

### Future Enhancements

- **Microservices**: Split into separate services
- **Message Queue**: Use RabbitMQ/Kafka for async processing
- **Caching Layer**: Redis for session and data caching
- **File Storage**: Cloud storage (S3, Cloudinary) for images
- **Search**: Elasticsearch for advanced search
- **Monitoring**: APM tools for performance tracking

## Deployment Architecture

### Development Environment

```
Local Machine
├── Backend (Node.js)
│   └── Port 4000
├── Frontend (Vite Dev Server)
│   └── Port 5173
└── MongoDB Atlas (Cloud)
    └── Connection via connection string
```

### Production Environment (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│              (Nginx / Cloud Load Balancer)              │
└──────────────┬───────────────────────┬──────────────────┘
               │                       │
    ┌──────────▼──────────┐  ┌────────▼──────────┐
    │   Backend Server 1  │  │  Backend Server 2 │
    │   (Node.js + PM2)   │  │  (Node.js + PM2)  │
    └──────────┬──────────┘  └────────┬──────────┘
               │                       │
               └───────────┬───────────┘
                           │
                ┌──────────▼──────────┐
                │    MongoDB Atlas    │
                │   (Primary + Replicas)│
                └─────────────────────┘
                           │
                ┌──────────▼──────────┐
                │   Redis (Optional)  │
                │  (Session/Cache)    │
                └─────────────────────┘

Frontend (Static Files)
├── CDN (CloudFlare / CloudFront)
└── Static Hosting (Vercel / Netlify / S3)
```

## Technology Decisions

### Why Node.js?

- **JavaScript everywhere**: Same language for frontend and backend
- **Non-blocking I/O**: Excellent for real-time applications
- **Rich ecosystem**: Large package ecosystem
- **Socket.IO**: Native WebSocket support

### Why MongoDB?

- **Flexible schema**: Easy to evolve data model
- **GeoJSON support**: Built-in geospatial queries
- **Scalability**: Horizontal scaling with sharding
- **Document model**: Natural fit for JavaScript objects

### Why Socket.IO?

- **Real-time communication**: Low latency messaging
- **Automatic fallback**: Works even with restrictive networks
- **Room management**: Easy to organize users
- **Built-in features**: Presence, typing indicators, etc.

### Why React?

- **Component-based**: Reusable UI components
- **Virtual DOM**: Efficient rendering
- **Large ecosystem**: Rich library ecosystem
- **Developer experience**: Excellent tooling

## Design Patterns

### Backend Patterns

- **MVC (Model-View-Controller)**: Separation of concerns
- **Middleware Pattern**: Request processing pipeline
- **Repository Pattern**: Data access abstraction (via Mongoose)
- **Factory Pattern**: Object creation (JWT tokens)

### Frontend Patterns

- **Component Pattern**: Reusable UI components
- **Container/Presenter**: Separation of logic and presentation
- **HOC (Higher Order Components)**: Code reuse
- **Custom Hooks**: Shared stateful logic

---

**Last Updated**: January 2024

