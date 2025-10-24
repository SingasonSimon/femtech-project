# FemTech - Women's Wellness Platform

A modern MERN stack application for women's health tracking, community engagement, and wellness education.

## Features

- 🔐 **Authentication**: JWT-based auth with refresh tokens
- 📊 **Health Tracking**: Period tracker with cycle insights and predictions
- 💬 **Community Forums**: Posts, replies, and likes system
- 📚 **Educational Blog**: Articles with image uploads
- 🛍️ **Product Catalog**: Wellness wearables with reviews
- 📈 **Analytics Dashboard**: Admin insights and metrics
- 🌙 **Dark Mode**: Beautiful light/dark theme toggle
- 📱 **Responsive Design**: Mobile-first approach

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- React Router (routing)
- React Query (data fetching)
- Axios (HTTP client)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (image uploads)
- bcryptjs (password hashing)

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Cloudinary account (optional for development)

### Installation

1. **Clone and setup**
   ```bash
   git clone https://github.com/SingasonSimon/femtech-project.git
   cd femtech-project
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   copy .env.example .env
   # Edit .env with your MongoDB URI and secrets
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   copy .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Environment Variables

**Server (.env)**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/femtech
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Client (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
femtech-project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route-based pages
│   │   ├── context/       # React contexts (Auth, Theme)
│   │   ├── services/      # API communication
│   │   └── hooks/         # Custom React hooks
│   └── package.json
└── server/                # Express backend
    ├── src/
    │   ├── models/        # Mongoose schemas
    │   ├── routes/        # API routes
    │   ├── controllers/   # Business logic
    │   ├── middleware/    # Auth, validation
    │   └── services/      # External services
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Health Tracking
- `GET /api/v1/periods` - Get period entries
- `POST /api/v1/periods` - Create period entry
- `GET /api/v1/periods/insights` - Get cycle insights

### Community
- `GET /api/v1/posts` - Get forum posts
- `POST /api/v1/posts` - Create post
- `POST /api/v1/posts/:id/replies` - Add reply
- `POST /api/v1/posts/:id/like` - Like/unlike post

### Content
- `GET /api/v1/articles` - Get published articles
- `GET /api/v1/products` - Get products
- `POST /api/v1/products/:id/reviews` - Add product review

### Admin
- `GET /api/v1/admin/analytics` - Get analytics data
- `GET /api/v1/admin/users` - Manage users
- `POST /api/v1/articles` - Create article (admin only)
- `POST /api/v1/products` - Create product (admin only)

## Development

### Running in Development
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

### Building for Production
```bash
# Backend
cd server && npm start

# Frontend
cd client && npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Author

**Collins Kipkeny**  
Registration: INTE/MG/2838/09/22  
Kabarak University - Department of Computer Science and Information Technology

---

*Empowering Women's Health Through Innovation and Inclusivity*
