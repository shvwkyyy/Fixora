# Fixora

A comprehensive service marketplace platform connecting users with skilled service providers. Fixora enables users to find and hire workers for various services including plumbing, electricity, cleaning, painting, and more.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shvwkyyy/Fixora
   cd Fixora
   ```

2. **Set up Backend**
   ```bash
   cd Backend
   npm install
   # Create .env file (see SETUP_GUIDE.md)
   node src/server.js
   ```

3. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 📖 Documentation

- **[Complete Documentation](./DOCUMENTATION.md)** - Comprehensive project documentation
- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed setup and installation guide
- **[Frontend Pages Requirements](./FRONTEND_PAGES_REQUIRED.md)** - Frontend development requirements

## 🏗️ Project Structure

```
Fixora/
├── Backend/          # Node.js + Express API
├── frontend/         # React + Vite frontend
└── Chatbot/         # React chatbot component
```

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based authentication
- 📋 **Service Requests** - Create and manage service requests
- 👷 **Worker Profiles** - Detailed worker profiles with portfolios
- 💬 **Real-time Messaging** - Socket.IO-powered messaging system
- ⭐ **Reviews & Ratings** - Rate and review workers
- 📍 **Location-based Matching** - Find workers near you
- ✅ **Worker Verification** - National ID verification system
- 🔔 **Notifications** - Real-time notifications
- 🤖 **AI Chatbot** - Customer support chatbot

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- bcryptjs

### Frontend
- React 19
- Vite
- React Router DOM
- Socket.IO Client
- Axios

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/getprofile` - Get user profile
- `POST /api/auth/logout` - Logout

### Service Requests
- `POST /api/service-requests` - Create service request
- `GET /api/service-requests` - List service requests
- `GET /api/service-requests/:id` - Get service request details
- `PUT /api/service-requests/:id/accept` - Accept service request

### Workers
- `GET /api/workers` - List workers
- `GET /api/workers/:workerId` - Get worker profile
- `PUT /api/workers/me` - Create/update worker profile

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversation/:otherUserId` - Get conversation messages

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/worker/:workerId` - Get worker reviews
- `DELETE /api/reviews/:reviewId` - Delete review

For complete API documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md#api-documentation)

## 🔌 Socket.IO Events

### Client → Server
- `message:send` - Send a message
- `typing` - Send typing indicator

### Server → Client
- `message:new` - New message received
- `typing` - Typing indicator received

For complete Socket.IO documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md#socketio-events)

## 🗄️ Database Models

- **User** - User accounts and authentication
- **WorkerProfile** - Worker profiles and specialties
- **ServiceRequest** - Service requests and jobs
- **Message** - Real-time messages
- **Review** - Worker reviews and ratings
- **Notification** - User notifications

For complete database schema, see [DOCUMENTATION.md](./DOCUMENTATION.md#database-schema)

## 🚦 Development

### Backend Development

```bash
cd Backend
npm install
# Create .env file
node src/server.js
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
MONGO_URI=your_mongodb_connection_string
PORT=4000
JWT_SECRET=your_secret_key
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000
```

## 📝 Testing

A Postman collection is available at:
```
Backend/tests/Fixora.postman_collection.json
```

Import this collection to test all API endpoints.

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests/15min)
- Input validation
- CORS configuration
- Socket.IO authentication

## 📱 Frontend Routes

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/profile` - User profile
- `/worker/register` - Worker registration
- `/worker/dashboard` - Worker dashboard
- `/worker/jobs` - Browse jobs (worker)
- `/jobs` - My jobs (user)
- `/jobs/create` - Create service request
- `/workers` - Browse workers
- `/messages` - Messages/Inbox

## 🐛 Troubleshooting

Common issues and solutions:

- **DB connection error** - Check MongoDB URI and IP whitelist
- **Port already in use** - Change PORT in .env
- **CORS errors** - Verify backend CORS configuration
- **401 Unauthorized** - Check JWT token in localStorage

For more troubleshooting tips, see [DOCUMENTATION.md](./DOCUMENTATION.md#troubleshooting)

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Check the [Documentation](./DOCUMENTATION.md)
- Review the [Setup Guide](./SETUP_GUIDE.md)
- Open an issue on GitHub

---

**Built with ❤️ by the Fixora team**
