# 💜 FemTech - Women's Wellness Platform

<div align="center">

![FemTech Banner](https://via.placeholder.com/1200x300/c026d3/ffffff?text=FemTech+-+Empowering+Women%27s+Health)

**A comprehensive MERN stack platform for women's health tracking, community engagement, and wellness education.**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.3.1-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green)](https://www.mongodb.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## 🌟 Overview

FemTech is a modern, full-stack web application designed to empower women's health through technology. It provides a comprehensive suite of tools for period tracking, community engagement, educational content, and product discovery—all in one beautifully designed, responsive platform.

### Why FemTech?

- **Privacy-First**: Your health data stays secure with JWT authentication
- **AI-Powered Insights**: Smart cycle predictions and personalized health tips
- **Community-Driven**: Connect with others, share experiences, and get support
- **Educational**: Access curated articles and product reviews
- **Modern UX**: Beautiful animations, dark mode, and responsive design

---

## ✨ Features

### 🔐 Authentication & Security
- **JWT-Based Authentication**: Secure login with access and refresh tokens
- **Role-Based Access Control**: User and Admin roles with protected routes
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Automatic token refresh and logout handling

### 📊 Health Tracking
- **Period Tracker**: Log menstrual cycles with flow intensity and symptoms
- **Cycle Insights**: AI-powered predictions for next period
- **Statistical Analysis**: Average cycle length, period duration, and regularity
- **Personalized Tips**: Context-aware health recommendations
- **Data Visualization**: Track your cycle patterns over time

### 💬 Community Forums
- **Discussion Posts**: Create and engage with community topics
- **Nested Replies**: Multi-level conversation threads
- **Like System**: Show support for helpful posts
- **Real-time Updates**: Instant notifications for new activity
- **Privacy Controls**: Optional anonymous posting

### 📚 Educational Content
- **Blog Articles**: Professionally written health and wellness content
- **Categories**: Health, Wellness, Products, Lifestyle, Education, News
- **Rich Media**: Image uploads via Cloudinary
- **Search & Filter**: Find relevant articles quickly
- **Reading Time**: Estimated reading duration

### 🛍️ Product Catalog
- **Wellness Products**: Curated selection of health tech and wearables
- **Product Reviews**: Star ratings and detailed user feedback
- **Review System**: Rate articles and products (1-5 stars)
- **Helpful Votes**: Mark reviews as helpful
- **External Links**: Direct purchase links to vendor sites

### 👤 Profile Management
- **User Profiles**: Customizable display name and bio
- **Profile Images**: Upload to Cloudinary with automatic optimization
- **Account Settings**: Change password and manage account
- **Activity Stats**: View your contributions (posts, articles, reviews)
- **Account Deletion**: Full data removal option

### 📈 Admin Dashboard
- **Analytics**: Real-time platform statistics and insights
- **User Management**: View, edit roles, and manage users
- **Content Management**: Publish/unpublish articles, manage products
- **Data Visualization**: Interactive charts with Recharts
  - User growth trends (last 30 days)
  - Content creation statistics
  - User role distribution pie chart
- **Recent Activity**: Monitor platform engagement

### 🎨 Design & UX
- **Animated Gradient Blobs**: Beautiful background animations
- **Dark Mode**: Seamless light/dark theme switching
- **Loading States**: Spinners on all async actions
- **Toast Notifications**: Real-time feedback for user actions
- **Responsive Design**: Mobile-first, works on all devices
- **Framer Motion**: Smooth page transitions and animations

---

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI library for building component-based interfaces |
| **Vite** | 5.4.11 | Fast build tool and development server |
| **React Router DOM** | 7.1.1 | Client-side routing and navigation |
| **TanStack Query** | 5.62.8 | Data fetching, caching, and state management |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **Framer Motion** | 11.15.0 | Animation library for React |
| **Recharts** | 2.15.0 | Composable charting library |
| **Axios** | 1.7.9 | HTTP client for API requests |
| **React Hot Toast** | 2.4.1 | Toast notifications |

### Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime environment |
| **Express** | 4.21.2 | Web application framework |
| **MongoDB** | 4.4+ | NoSQL database |
| **Mongoose** | 8.9.4 | MongoDB object modeling |
| **JWT (jsonwebtoken)** | 9.0.2 | Authentication tokens |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Cloudinary** | 2.5.1 | Cloud-based image storage and management |
| **Express Validator** | 7.2.1 | Request validation middleware |
| **Multer** | 1.4.5-lts.1 | Multipart form data handling |
| **Cookie Parser** | 1.4.7 | Parse cookies from requests |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Dotenv** | 17.2.3 | Environment variable management |
| **Nodemon** | 3.1.10 | Auto-restart server on file changes |

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- **Cloudinary Account** (optional for development) - [Sign up](https://cloudinary.com/users/register/free)
- **Git** - [Download](https://git-scm.com/downloads)

### Recommended

- **MongoDB Compass** - GUI for MongoDB
- **Postman** - API testing tool
- **VS Code** - Code editor with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/SingasonSimon/femtech-project.git
cd femtech-project
```

### Step 2: Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials (see Environment Variables section)
nano .env  # or use your preferred editor
```

### Step 3: Frontend Setup

```bash
# Navigate to client directory (from project root)
cd ../client

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your API URL
nano .env  # or use your preferred editor
```

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Step 5: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

---

## ⚙️ Environment Variables

### Server Configuration (`server/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/femtech?retryWrites=true&w=majority

# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET=your_super_secret_access_token_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client Configuration (`client/.env`)

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 🔑 Generating JWT Secrets

Use the following command to generate secure random strings:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📁 Project Structure

```
femtech-project/
│
├── client/                          # React Frontend Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Navbar.jsx          # Main navigation bar
│   │   │   ├── ProtectedRoute.jsx  # Route protection HOC
│   │   │   └── ReviewSection.jsx   # Reviews component
│   │   │
│   │   ├── context/                 # React Context providers
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   └── ThemeContext.jsx    # Dark mode state
│   │   │
│   │   ├── pages/                   # Route-based page components
│   │   │   ├── LandingPage.jsx     # Homepage
│   │   │   ├── LoginPage.jsx       # User login
│   │   │   ├── RegisterPage.jsx    # User registration
│   │   │   ├── DashboardPage.jsx   # User/Admin dashboard
│   │   │   ├── PeriodTrackerPage.jsx  # Period tracking
│   │   │   ├── ForumPage.jsx       # Community forum
│   │   │   ├── BlogPage.jsx        # Articles listing
│   │   │   ├── ArticlePage.jsx     # Article detail view
│   │   │   ├── ProductsPage.jsx    # Products catalog
│   │   │   ├── ProductDetailPage.jsx  # Product details
│   │   │   ├── ProfilePage.jsx     # User profile management
│   │   │   ├── ManageUsersPage.jsx # Admin: User management
│   │   │   ├── ManageArticlesPage.jsx # Admin: Article management
│   │   │   └── AnalyticsPage.jsx   # Admin: Analytics dashboard
│   │   │
│   │   ├── services/                # API communication
│   │   │   └── api.js              # Axios instance & interceptors
│   │   │
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Global styles
│   │
│   ├── index.html                   # HTML template
│   ├── package.json                 # Dependencies & scripts
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   └── postcss.config.js            # PostCSS configuration
│
└── server/                          # Express Backend Application
    ├── src/
    │   ├── models/                  # Mongoose schemas
    │   │   ├── User.js             # User model
    │   │   ├── Post.js             # Forum post model
    │   │   ├── Reply.js            # Post reply model
    │   │   ├── Article.js          # Blog article model
    │   │   ├── Product.js          # Product model
    │   │   ├── Review.js           # Review model
    │   │   ├── PeriodEntry.js      # Period tracking model
    │   │   └── Profile.js          # User profile model
    │   │
    │   ├── routes/                  # API route definitions
    │   │   ├── auth.routes.js      # Authentication routes
    │   │   ├── forum.routes.js     # Forum routes
    │   │   ├── article.routes.js   # Article routes
    │   │   ├── product.routes.js   # Product routes
    │   │   ├── review.routes.js    # Review routes
    │   │   ├── period.routes.js    # Period tracker routes
    │   │   ├── profile.routes.js   # Profile routes
    │   │   └── admin.routes.js     # Admin routes
    │   │
    │   ├── controllers/             # Business logic
    │   │   ├── authController.js   # Auth handlers
    │   │   ├── forumController.js  # Forum handlers
    │   │   ├── articleController.js # Article handlers
    │   │   ├── productController.js # Product handlers
    │   │   ├── reviewController.js # Review handlers
    │   │   ├── periodController.js # Period tracker handlers
    │   │   ├── profileController.js # Profile handlers
    │   │   └── adminController.js  # Admin handlers
    │   │
    │   ├── middleware/              # Custom middleware
    │   │   └── auth.js             # Authentication middleware
    │   │
    │   ├── config/                  # Configuration files
    │   │   ├── database.js         # MongoDB connection
    │   │   └── cloudinary.js       # Cloudinary setup
    │   │
    │   └── server.js                # Express app & server setup
    │
    ├── package.json                 # Dependencies & scripts
    └── .env                         # Environment variables (not in repo)
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "Jane Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <accessToken>
```

#### Logout
```http
POST /auth/logout
```

#### Refresh Token
```http
POST /auth/refresh
```

---

### Period Tracker Endpoints

#### Create Period Entry
```http
POST /periods
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "startDate": "2025-01-15",
  "endDate": "2025-01-20",
  "flow": "medium",
  "symptoms": ["cramps", "fatigue"],
  "notes": "Feeling okay overall"
}
```

#### Get Period Entries
```http
GET /periods?page=1&limit=10
Authorization: Bearer <accessToken>
```

#### Get Cycle Insights
```http
GET /periods/insights
Authorization: Bearer <accessToken>
```

#### Update Period Entry
```http
PUT /periods/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "flow": "heavy",
  "symptoms": ["cramps", "fatigue", "headache"]
}
```

#### Delete Period Entry
```http
DELETE /periods/:id
Authorization: Bearer <accessToken>
```

---

### Forum Endpoints

#### Get All Posts
```http
GET /posts?page=1&limit=10&search=health
```

#### Create Post
```http
POST /posts
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "First Time Tracking - Tips?",
  "content": "Just started using the period tracker...",
  "tags": ["beginners", "tips"]
}
```

#### Get Single Post
```http
GET /posts/:id
```

#### Add Reply
```http
POST /posts/:postId/replies
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "Great question! Here's what helped me...",
  "parentReplyId": null
}
```

#### Like/Unlike Post
```http
POST /posts/:id/like
Authorization: Bearer <accessToken>
```

---

### Article Endpoints

#### Get Published Articles
```http
GET /articles?page=1&limit=10&category=health&search=wellness
```

#### Get Single Article
```http
GET /articles/:slug
```

#### Create Article (Admin)
```http
POST /articles
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

{
  "title": "Understanding Your Menstrual Cycle",
  "content": "Detailed article content...",
  "excerpt": "Learn about the phases of your cycle",
  "category": "health",
  "tags": ["education", "health"],
  "featuredImage": <file>,
  "published": true
}
```

#### Update Article (Admin)
```http
PUT /articles/:id
Authorization: Bearer <accessToken>
```

#### Delete Article (Admin)
```http
DELETE /articles/:id
Authorization: Bearer <accessToken>
```

---

### Product Endpoints

#### Get Products
```http
GET /products?page=1&limit=12&category=wearables
```

#### Get Single Product
```http
GET /products/:slug
```

#### Create Product (Admin)
```http
POST /products
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

{
  "name": "Smart Health Tracker",
  "description": "Advanced wellness wearable",
  "price": 199.99,
  "category": "wearables",
  "brand": "HealthTech",
  "productUrl": "https://vendor.com/product",
  "images": [<file1>, <file2>]
}
```

---

### Review Endpoints

#### Get Reviews
```http
GET /reviews/:targetType/:targetId?page=1&limit=10
# targetType: 'Article' or 'Product'
```

#### Get User's Review
```http
GET /reviews/:targetType/:targetId/user
Authorization: Bearer <accessToken>
```

#### Create/Update Review
```http
POST /reviews/:targetType/:targetId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "rating": 5,
  "title": "Excellent article!",
  "comment": "Very informative and well-written"
}
```

#### Mark Review as Helpful
```http
POST /reviews/:id/helpful
Authorization: Bearer <accessToken>
```

#### Delete Review
```http
DELETE /reviews/:id
Authorization: Bearer <accessToken>
```

---

### Profile Endpoints

#### Get Profile
```http
GET /profile
Authorization: Bearer <accessToken>
```

#### Update Profile
```http
PUT /profile
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

{
  "displayName": "Jane Smith",
  "bio": "Health enthusiast and wellness advocate",
  "profileImage": <file>
}
```

#### Change Password
```http
PUT /profile/password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePass456!"
}
```

#### Delete Profile Image
```http
DELETE /profile/image
Authorization: Bearer <accessToken>
```

#### Delete Account
```http
DELETE /profile/account
Authorization: Bearer <accessToken>
```

---

### Admin Endpoints

#### Get Dashboard Statistics
```http
GET /admin/stats
Authorization: Bearer <accessToken> (Admin only)
```

#### Get Recent Activity
```http
GET /admin/activity
Authorization: Bearer <accessToken> (Admin only)
```

#### Get All Users
```http
GET /admin/users?page=1&limit=10&search=jane
Authorization: Bearer <accessToken> (Admin only)
```

#### Update User Role
```http
PUT /admin/users/:id/role
Authorization: Bearer <accessToken> (Admin only)
Content-Type: application/json

{
  "role": "admin"
}
```

#### Delete User
```http
DELETE /admin/users/:id
Authorization: Bearer <accessToken> (Admin only)
```

---

## 📖 Usage Guide

### For Users

1. **Getting Started**
   - Visit the landing page
   - Click "Get Started" to create an account
   - Fill in your details and register

2. **Tracking Your Cycle**
   - Navigate to "Period Tracker"
   - Click "Log Period"
   - Enter start/end dates, flow, and symptoms
   - View your cycle insights and predictions

3. **Engaging with Community**
   - Browse forum posts
   - Create a new discussion
   - Reply to others and like helpful posts

4. **Reading Articles**
   - Explore educational content in the Blog
   - Filter by category or search topics
   - Leave reviews on articles

5. **Discovering Products**
   - Browse wellness products
   - Read user reviews
   - Click "View Product on Site" to purchase

6. **Managing Your Profile**
   - Update your display name and bio
   - Upload a profile picture
   - Change your password
   - View your activity stats

### For Administrators

1. **Admin Dashboard**
   - Access from the main dashboard
   - View platform statistics and analytics
   - Monitor recent activity

2. **User Management**
   - View all registered users
   - Change user roles (user ↔ admin)
   - Delete problematic accounts

3. **Content Management**
   - Create and publish articles
   - Manage product listings
   - Publish/unpublish content

4. **Analytics**
   - View user growth charts
   - Track content creation trends
   - Monitor role distribution

---

## 👨‍💻 Development

### Running in Development Mode

**Backend with hot reload:**
```bash
cd server
npm run dev  # Uses nodemon
```

**Frontend with HMR:**
```bash
cd client
npm run dev  # Uses Vite
```

### Building for Production

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build      # Creates optimized build
npm run preview    # Preview production build
```

### Code Quality

**Lint Frontend:**
```bash
cd client
npm run lint
```

---

## 🚢 Deployment

### Deploying Backend (Railway/Render)

1. Create a new project
2. Connect your GitHub repository
3. Set environment variables
4. Deploy from `server` directory
5. Set start command: `node src/server.js`

### Deploying Frontend (Vercel/Netlify)

1. Create a new project
2. Connect your GitHub repository
3. Set build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. Set environment variables (`VITE_API_BASE_URL`)
5. Deploy

### Environment Variables for Production

**Backend:**
- Set `NODE_ENV=production`
- Use production MongoDB cluster
- Generate new JWT secrets
- Update `CLIENT_URL` to production URL

**Frontend:**
- Update `VITE_API_BASE_URL` to production API

---

## 🔧 Troubleshooting

### Common Issues

**Issue: MongoDB Connection Failed**
```
Solution: 
- Verify MONGO_URI in .env
- Check MongoDB Atlas IP whitelist
- Ensure database user has correct permissions
```

**Issue: Images Not Uploading**
```
Solution:
- Verify Cloudinary credentials
- Check file size limits (default: 10MB)
- Ensure multer middleware is configured
```

**Issue: 401 Unauthorized Errors**
```
Solution:
- Check if JWT tokens are being sent in cookies
- Verify JWT_ACCESS_SECRET matches on backend
- Clear browser cookies and login again
```

**Issue: CORS Errors**
```
Solution:
- Verify CLIENT_URL in server .env
- Check CORS configuration in server.js
- Ensure credentials: true in axios config
```

**Issue: Charts Not Displaying**
```
Solution:
- Check if backend returns data in correct format
- Verify Recharts is installed
- Check browser console for errors
```

### Development Tips

- Use MongoDB Compass to inspect database
- Use Postman to test API endpoints
- Check browser DevTools Network tab for API calls
- Use React DevTools to debug component state
- Check server console for backend errors

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git fork https://github.com/SingasonSimon/femtech-project.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**

### Code Style Guidelines

- Use ESLint for JavaScript
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update README for new features

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👤 Author

**Singason Simon**  
📧 Email: singason65@gmail.com  
🎓 Kabarak University - Department of Computer Science and Information Technology  


---

## 🙏 Acknowledgments

- **Kabarak University** for academic support
- **MongoDB Atlas** for database hosting
- **Cloudinary** for image storage
- **Vercel** for frontend hosting
- **Railway** for backend hosting
- **Open Source Community** for amazing tools and libraries

---

## 📞 Support

For support, please:
- 📧 Email: singason65@gmail.com
- 🐛 [Open an issue](https://github.com/SingasonSimon/femtech-project/issues)
- 💬 Join our community forum

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

*Empowering Women's Health Through Innovation and Inclusivity*

Made with 💜 by Singason Simon

</div>
