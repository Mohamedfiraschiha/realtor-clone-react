# 🏠 FourWalls

**Your Home Awaits** - A modern, AI-powered real estate platform for finding your perfect property.

## ✨ Features

### 🤖 AI-Powered Features
- **AI Price Prediction** - Machine learning model predicts optimal property prices
- **Smart Property Recommendations** - Intelligent matching based on user preferences

### 🏡 Property Management
- Create, edit, and manage property listings
- Upload multiple property images (Cloudinary integration)
- Advanced search with filters (type, bedrooms, bathrooms, price range)
- Interactive map view with property locations
- Geocoding for accurate property positioning

### 👥 User Engagement
- **Favorites** - Save properties you love
- **Visit Requests** - Schedule property viewings
- **Offers** - Make and negotiate property offers
- **Rental Applications** - Submit comprehensive rental applications
- **Interested Button** - Express interest in properties

### 🔔 Real-time Notifications
- Instant notifications for property interactions
- Favorite alerts for property owners
- Visit request updates
- Offer status notifications
- Application status updates
- Unread notification counter with auto-refresh

### 💬 Communication
- Real-time chat system (Socket.IO)
- Direct messaging between buyers and sellers
- Conversation management

### 🎨 Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- Smooth animations and transitions
- Mobile-friendly interface
- Gradient buttons and modern components
- Icon-based navigation

### 🛡️ Security & Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Protected routes and API endpoints
- OAuth integration (Google Sign-In)

## 🚀 Tech Stack

### Frontend
- **React** 19.1.0
- **React Router** 6.30.1
- **Tailwind CSS** 3.4.17
- **React Icons** 5.5.0
- **React Leaflet** 5.0.0 (Map integration)
- **Socket.IO Client** 4.8.1
- **React Toastify** 11.0.5

### Backend
- **Next.js** 15.3.5
- **MongoDB** 6.17.0
- **Socket.IO** 4.8.1
- **JWT** 9.0.2
- **Bcrypt** 2.4.3

### AI/ML
- **Python** (Flask API)
- **Scikit-learn** (Price prediction model)
- **Pandas & NumPy** (Data processing)

### External Services
- **Cloudinary** - Image hosting
- **OpenStreetMap Nominatim** - Geocoding
- **Firebase** - Additional authentication

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- MongoDB
- Python 3.8+

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Python API Setup
```bash
cd backend/python-api
pip install -r requirements.txt
python app.py
```

## 🌐 Environment Variables

### Frontend (.env)
```
REACT_APP_API_BASE_URL=your_backend_url
```

### Backend (.env.local)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## 📱 Key Pages

- **Home** - Featured listings and advanced search
- **Map View** - Interactive property map
- **Favorites** - Saved properties
- **Notifications** - Real-time alerts
- **Profile** - User account management
- **Create Listing** - Add new properties with AI price suggestions
- **Manage Visits** - Property owner visit request management
- **Manage Offers** - View and respond to offers
- **Manage Applications** - Review rental applications

## 🎯 Notification Types

- ❤️ Favorite added
- 👍 Interested in property
- 📅 Visit request/approved/rejected
- 🤝 Offer received/accepted/rejected/countered
- 📝 Application received/approved/rejected

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/forgot-password`

### Listings
- `GET /api/listings`
- `POST /api/listings`
- `PUT /api/listings/:id`
- `DELETE /api/listings/:id`

### User Features
- `GET/POST/DELETE /api/favorites`
- `GET/POST/PATCH /api/visit-requests`
- `GET/POST/PATCH /api/offers`
- `GET/POST/PATCH /api/rental-applications`
- `GET/POST/PATCH/DELETE /api/notifications`

### Chat
- `GET/POST /api/chat/conversations`
- `GET/POST /api/chat/messages`

## 🎨 Design Philosophy

FourWalls embraces a modern, clean design with:
- Gradient accents (slate-900 to slate-700)
- Color-coded features (red for favorites, blue for visits, green for offers)
- Smooth animations and micro-interactions
- Responsive layouts for all devices
- Intuitive navigation with icon support

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

Mohamed Firas Chiha

---

**FourWalls** - Where Finding Home Flows Naturally 🏠
