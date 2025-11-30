# Frontend Pages Required for Fixora Backend Integration

## Backend Overview

The backend uses:
- **REST API** for authentication (`/api/auth`)
- **Socket.io** for real-time features (jobs, messaging, presence)
- **MongoDB** with models for Users, Workers, Jobs, Messages, Reviews, etc.

---

## Required Frontend Pages

### 1. **Authentication Pages**

#### 1.1 Login Page (`/login`)
- **Route**: `/login`
- **API Endpoint**: `POST /api/auth/login`
- **Fields**: Email, Password
- **Features**:
  - Form validation
  - Error handling
  - Store accessToken and refreshToken
  - Redirect based on userType (user/worker/admin)
  - Remember me option

#### 1.2 Register Page (`/register`)
- **Route**: `/register`
- **API Endpoint**: `POST /api/auth/register`
- **Fields**: 
  - First Name, Last Name
  - Email, Password, Confirm Password
  - Phone (Egyptian format validation)
  - City, Area
  - User Type selection (User/Worker)
  - Location coordinates (from map/GPS)
- **Features**:
  - Form validation
  - Location picker/map integration
  - Password strength indicator
  - Email/phone validation

#### 1.3 Profile Page (`/profile`)
- **Route**: `/profile`
- **API Endpoint**: `GET /api/auth/getprofile` (protected)
- **Note**: There's a mismatch in backend - route calls `authController.me` but export is `getprofile`. May need backend fix.
- **Features**:
  - Display user information
  - Edit profile (update fields)
  - Upload profile photo
  - Change password
  - View location on map

---

### 2. **Worker-Specific Pages**

#### 2.1 Worker Registration/Onboarding (`/worker/register`)
- **Route**: `/worker/register`
- **Features**:
  - Worker profile creation
  - Specialty selection (Plumbing, Electricity, Cleaning, Painting, etc.)
  - Hourly price setting
  - Portfolio upload (photos + descriptions)
  - National ID verification (front, back, with face)
  - Social media links (Facebook, TikTok, LinkedIn)
  - Verification status display

#### 2.2 Worker Dashboard (`/worker/dashboard`)
- **Route**: `/worker/dashboard`
- **Socket Events**: 
  - Listen to `job:applied` (when client accepts their application)
  - Listen to `message:new` (incoming messages)
- **Features**:
  - Available jobs list (nearby jobs by specialty)
  - Applied jobs status
  - Active jobs
  - Completed jobs count
  - Earnings summary
  - Profile completion status
  - Verification status

#### 2.3 Worker Profile Page (`/worker/:workerId`)
- **Route**: `/worker/:workerId` (public view)
- **Features**:
  - Worker information display
  - Specialty and hourly rate
  - Portfolio gallery
  - Reviews and ratings
  - Contact button
  - Social media links

#### 2.4 Browse Jobs Page (`/worker/jobs`)
- **Route**: `/worker/jobs`
- **Socket Events**: 
  - `job:create` (listen for new jobs matching specialty)
- **Features**:
  - Filter by specialty
  - Filter by distance
  - Job cards with:
    - Problem description
    - Location
    - Distance
    - Apply button
  - Real-time job updates

#### 2.5 Job Application Page (`/worker/jobs/:jobId/apply`)
- **Route**: `/worker/jobs/:jobId/apply`
- **Socket Event**: `job:apply`
- **Features**:
  - Job details view
  - Proposal form (price, timeline, message)
  - Submit application
  - Application status

---

### 3. **Client/User Pages**

#### 3.1 Home Page (`/`)
- **Route**: `/`
- **Features**:
  - Service categories
  - Search functionality
  - Browse workers by specialty
  - How it works section
  - Already exists (Body component)

#### 3.2 Create Job/Service Request (`/jobs/create`)
- **Route**: `/jobs/create`
- **Socket Event**: `job:create`
- **Features**:
  - Problem description form
  - Specialty selection
  - Location picker (map/GPS)
  - Upload photos (optional)
  - Submit job request
  - Real-time worker matching

#### 3.3 My Jobs Page (`/jobs`)
- **Route**: `/jobs`
- **Socket Events**:
  - `job:applied` (when worker applies)
  - `job:accepted` (when worker accepts)
  - `message:new` (messages related to jobs)
- **Features**:
  - Active jobs list
  - Pending applications
  - In-progress jobs
  - Completed jobs
  - Job status tracking
  - Accept/reject applications

#### 3.4 Job Details Page (`/jobs/:jobId`)
- **Route**: `/jobs/:jobId`
- **Features**:
  - Job details
  - List of applicants (workers)
  - Worker profiles preview
  - Accept/reject applicants
  - Chat with selected worker
  - Job status updates

#### 3.5 Browse Workers Page (`/workers`)
- **Route**: `/workers`
- **Features**:
  - Filter by specialty
  - Filter by location/distance
  - Filter by price range
  - Sort by rating, price, distance
  - Worker cards with:
    - Name, photo
    - Specialty, hourly rate
    - Rating, reviews count
    - Distance
    - View profile button

---

### 4. **Messaging Pages**

#### 4.1 Messages/Inbox Page (`/messages`)
- **Route**: `/messages`
- **Socket Events**:
  - `message:new` (receive messages)
  - `message:send` (send messages)
  - `typing` (typing indicators)
  - `presence:connected` / `presence:disconnected` (online status)
- **Features**:
  - Conversations list
  - Unread message count
  - Online/offline indicators
  - Search conversations
  - Filter by job-related messages

#### 4.2 Chat Page (`/messages/:userId`)
- **Route**: `/messages/:userId` or `/messages/:jobId`
- **Socket Events**:
  - `message:send` (send message)
  - `message:new` (receive message)
  - `typing` (show typing indicator)
- **Features**:
  - Chat interface
  - Message history
  - Real-time messaging
  - Typing indicators
  - Image upload
  - Job context (if job-related)
  - Online status

---

### 5. **Review & Rating Pages**

#### 5.1 Review Worker Page (`/reviews/create/:workerId`)
- **Route**: `/reviews/create/:workerId`
- **Features**:
  - Rating (1-5 stars)
  - Comment textarea
  - Submit review
  - Only after job completion

#### 5.2 Worker Reviews Page (`/worker/:workerId/reviews`)
- **Route**: `/worker/:workerId/reviews`
- **Features**:
  - All reviews for worker
  - Average rating
  - Review cards with:
    - Rating
    - Comment
    - Reviewer name
    - Date

---

### 6. **Notification Page**

#### 6.1 Notifications Page (`/notifications`)
- **Route**: `/notifications`
- **Socket Events**: Real-time notifications
- **Features**:
  - Notification list
  - Mark as read
  - Filter by type
  - Notification types:
    - Job application received
    - Job accepted
    - New message
    - Review received
    - Verification status

---

### 7. **Admin Pages** (if needed)

#### 7.1 Admin Dashboard (`/admin/dashboard`)
- **Route**: `/admin/dashboard`
- **Features**:
  - User management
  - Worker verification
  - Job monitoring
  - Reports

#### 7.2 Worker Verification (`/admin/workers/verify`)
- **Route**: `/admin/workers/verify`
- **Features**:
  - Pending verifications list
  - View National ID documents
  - Approve/reject workers

---

## Additional Components Needed

### 1. **Socket Context/Provider**
- Initialize Socket.io connection
- Handle authentication
- Manage socket events globally
- Reconnection logic

### 2. **Auth Context/Provider**
- User authentication state
- Token management (accessToken, refreshToken)
- Auto-refresh tokens
- Protected route wrapper

### 3. **Location Services**
- Get user location (GPS)
- Map integration (Google Maps/Mapbox)
- Location picker component
- Distance calculation

### 4. **File Upload Component**
- Profile photos
- Portfolio images
- National ID documents
- Job-related photos

### 5. **Protected Route Component**
- Wrapper for authenticated pages
- Redirect to login if not authenticated
- Role-based access (user/worker/admin)

### 6. **Notification Component**
- Toast notifications
- In-app notification bell
- Real-time notification updates

---

## API Integration Summary

### REST Endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/getprofile` - Get user profile (protected)
- `POST /api/auth/logout` - Logout

### Socket.io Events:

**Client → Server:**
- `job:create` - Create a new job
- `job:apply` - Worker applies to job
- `job:accept` - Client accepts worker application
- `message:send` - Send a message
- `typing` - Send typing indicator

**Server → Client:**
- `job:applied` - Worker applied to your job
- `job:accepted` - Your application was accepted
- `message:new` - New message received
- `typing` - User is typing
- `presence:connected` - User came online
- `presence:disconnected` - User went offline

---

## Priority Order for Development

1. **Phase 1 - Authentication** (Critical)
   - Login page
   - Register page
   - Auth context/provider
   - Protected routes

2. **Phase 2 - Core Features** (High Priority)
   - Home page (already exists)
   - Create job page
   - My jobs page
   - Browse workers page
   - Socket.io integration

3. **Phase 3 - Worker Features** (High Priority)
   - Worker registration
   - Worker dashboard
   - Browse jobs (worker)
   - Job application

4. **Phase 4 - Communication** (Medium Priority)
   - Messages page
   - Chat interface
   - Notifications

5. **Phase 5 - Reviews & Polish** (Low Priority)
   - Review system
   - Profile pages
   - Admin pages

---

## Technical Requirements

### Dependencies to Install:
```bash
npm install socket.io-client
npm install axios
npm install react-router-dom
npm install @react-google-maps/api  # or react-leaflet for maps
npm install react-hook-form  # for forms
npm install zod  # for validation
```

### Environment Variables Needed:
```
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=your_key
```

---

## Notes

- The backend uses **Socket.io** for real-time features, so you'll need to integrate `socket.io-client` in the frontend
- User location is stored as GeoJSON Point with coordinates [longitude, latitude]
- Worker verification requires National ID uploads
- Jobs are matched to workers based on specialty and location (geospatial query)
- Messages can be job-related or direct user-to-user
- All protected routes require JWT token in Authorization header

