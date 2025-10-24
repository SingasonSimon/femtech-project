# Changelog

All notable changes to the FemTech project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-24

### Added - Core Features

#### Authentication & Security
- JWT-based authentication with access and refresh tokens
- Role-based access control (User and Admin roles)
- Secure password hashing with bcryptjs
- Automatic token refresh mechanism
- Session management with HTTP-only cookies

#### Health Tracking
- Period tracker with cycle logging (start date, end date, flow, symptoms)
- AI-powered cycle insights and predictions
- Statistical analysis (average cycle length, period duration, regularity)
- Personalized health tips based on cycle data
- Cycle visualization with historical data

#### Community Features
- Forum discussion posts with title, content, and tags
- Nested reply system with multi-level threading
- Like/unlike functionality for posts
- Real-time activity updates
- Search and pagination for posts

#### Content Management
- Blog articles with categories (Health, Wellness, Products, Lifestyle, Education, News)
- Rich text content with image uploads via Cloudinary
- Article search and filtering
- Reading time estimation
- Publish/unpublish controls for admins

#### Product Catalog
- Wellness product listings with images
- Product details with descriptions and specifications
- External purchase links
- Product categories and search

#### Review System
- Star ratings (1-5) for articles and products
- Detailed review comments with titles
- "Helpful" voting system for reviews
- Review statistics and rating distribution
- User-specific review management

#### Profile Management
- Customizable user profiles with display name and bio
- Profile image uploads to Cloudinary
- Account settings and password management
- Activity statistics (posts, articles, period entries)
- Account deletion with full data removal

#### Admin Dashboard
- Real-time platform statistics
- Interactive charts with Recharts:
  - User growth trends (last 30 days)
  - Content creation statistics  
  - User role distribution pie chart
- User management (view, edit roles, delete)
- Content management (articles, products)
- Recent activity monitoring

#### UI/UX Features
- Animated gradient blobs on landing, login, and register pages
- Smooth page transitions with Framer Motion
- Dark mode with seamless theme switching
- Loading spinners on all async actions
- Toast notifications for user feedback
- Fully responsive design (mobile-first approach)
- Navigation bars on login/register pages

### Technical Implementation

#### Frontend Technologies
- React 18.3.1 with hooks and functional components
- Vite 5.4.11 for fast development and builds
- React Router DOM 7.1.1 for client-side routing
- TanStack Query 5.62.8 for data fetching and caching
- Tailwind CSS 3.4.17 for utility-first styling
- Framer Motion 11.15.0 for animations
- Recharts 2.15.0 for data visualization
- Axios 1.7.9 for HTTP requests
- React Hot Toast 2.4.1 for notifications

#### Backend Technologies
- Node.js 18+ with Express 4.21.2
- MongoDB with Mongoose 8.9.4 ODM
- JWT (jsonwebtoken 9.0.2) for authentication
- bcryptjs 2.4.3 for password hashing
- Cloudinary 2.5.1 for image management
- Express Validator 7.2.1 for request validation
- Multer 1.4.5-lts.1 for file uploads
- CORS 2.8.5 for cross-origin requests
- Nodemon 3.1.10 for development

#### Database Models
- User (authentication, roles, profile)
- Post (forum discussions)
- Reply (nested comments)
- Article (blog content)
- Product (wellness items)
- Review (ratings and feedback)
- PeriodEntry (cycle tracking)
- Profile (extended user information)

#### API Endpoints Implemented
- **Authentication**: `/api/v1/auth/*` (register, login, logout, refresh, me)
- **Period Tracker**: `/api/v1/periods/*` (CRUD, insights)
- **Forum**: `/api/v1/posts/*` (CRUD, replies, likes)
- **Articles**: `/api/v1/articles/*` (CRUD, search, filter)
- **Products**: `/api/v1/products/*` (CRUD, search)
- **Reviews**: `/api/v1/reviews/*` (CRUD, helpful votes)
- **Profile**: `/api/v1/profile/*` (update, password, delete)
- **Admin**: `/api/v1/admin/*` (stats, users, activity)

### Security Features
- Password requirements enforcement
- JWT token expiration (15m access, 7d refresh)
- HTTP-only cookie storage
- CORS configuration
- Request validation with express-validator
- MongoDB injection protection
- XSS protection through React
- Secure password reset flow

### Performance Optimizations
- React Query caching for API responses
- Lazy loading for images via Cloudinary
- Optimistic UI updates
- Debounced search inputs
- Pagination for large datasets
- MongoDB indexes on frequently queried fields

### Documentation
- Comprehensive README.md with installation guide
- API_DOCUMENTATION.md with complete endpoint reference
- CONTRIBUTING.md with development guidelines
- Inline code comments for complex logic
- JSDoc comments for utility functions

### Development Tools
- ESLint for code quality
- Nodemon for automatic server restarts
- Vite HMR for instant frontend updates
- MongoDB Compass for database inspection
- Postman collections for API testing

---

## [Unreleased]

### Planned Features
- Email verification for new users
- Password reset via email
- Two-factor authentication (2FA)
- Social media authentication (Google, Facebook)
- Push notifications
- Mobile app (React Native)
- Advanced analytics for users
- Export period data (PDF, CSV)
- Medication reminders
- Appointment scheduling
- Telemedicine integration
- Community messaging/DMs
- Mood tracking
- Symptom predictions using ML
- Multi-language support (i18n)
- Accessibility improvements (WCAG compliance)

### Known Issues
- None reported

---

## Version History

- **1.0.0** (2025-01-24): Initial release with core features

---

## Migration Notes

### From 0.x to 1.0.0
This is the initial stable release. No migration needed.

---

## Contributors

- **Singason Simon** - Initial development and core features
- **Mr. Sammy Murono** - Project supervision

---

## License

ISC License - See LICENSE file for details

---

For questions about this changelog, contact: singason65@gmail.com

