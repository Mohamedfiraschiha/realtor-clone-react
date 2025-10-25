# Running FourWalls Application

## Development Setup

### Backend (Next.js + Socket.io)

The backend now runs TWO servers simultaneously:

1. **Next.js API Server** - Port 3001 (for REST APIs)
2. **Socket.io Server** - Port 3002 (for real-time chat)

#### Start Backend:
```bash
cd backend
npm run dev:all
```

This single command starts both servers using `concurrently`.

**Or run them separately:**

```bash
# Terminal 1 - Next.js API server
cd backend
npm run dev

# Terminal 2 - Socket.io server
cd backend
npm run socket
```

### Frontend (React)

```bash
cd frontend
npm start
```

## Application Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Socket.io Server**: http://localhost:3002

## Features

### ✅ Completed Features:

1. **Notifications System**
   - Real-time notification bell with unread count
   - Notifications page with All/Unread filters
   - Mark as read, Mark all as read, Delete notifications
   - Notifications created for:
     - Visit requests (create, approve, reject)
     - Offers (create, accept, reject, counter)
     - Rental applications (create, approve, reject)
     - Favorites (when someone favorites your listing)

2. **Management Pages**
   - Received/Sent tabs for Visits, Offers, and Applications
   - Independent counts for each tab
   - Proper data isolation between users
   - Action buttons only on Received tab

3. **Real-time Chat**
   - Standalone Socket.io server for messaging
   - Online/offline status indicators
   - Typing indicators
   - Message persistence to database
   - Works with or without WebSocket connection

### 🔧 Technical Fixes:

- Fixed JWT payload access (`payload.userId` instead of `payload.id`)
- Fixed listing owner lookup (using `userEmail` instead of `userRef`)
- Fixed CORS to include PATCH method
- Fixed API endpoint paths (using proxy instead of hardcoded URLs)
- Converted all notification IDs to strings for consistent querying
- Added extensive logging for debugging

## Environment Variables

### Backend (.env.local)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SOCKET_PORT=3002
```

### Frontend (.env)
```
REACT_APP_SOCKET_URL=http://localhost:3002
```

## Troubleshooting

### Chat not connecting?
- Ensure both backend servers are running (port 3001 and 3002)
- Check browser console for Socket.io connection logs
- Verify REACT_APP_SOCKET_URL in frontend .env

### Notifications not appearing?
- Check backend terminal for notification creation logs
- Verify user is logged in with valid JWT token
- Ensure listing has `userEmail` field in database

### Old data issues?
- Records created before fixes may have null `userId` or `buyerId`
- Create new test data after backend restart to see notifications
