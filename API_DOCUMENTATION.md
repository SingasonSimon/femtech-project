# FemTech API Documentation

Complete API reference for the FemTech backend.

## Base URL

```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication

Most endpoints require authentication using JWT tokens sent via HTTP-only cookies.

### Headers

```
Content-Type: application/json
```

Cookies are automatically included for authenticated requests.

---

## Authentication Endpoints

### Register User

Creates a new user account.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "Jane Doe"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "displayName": "Jane Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-01-24T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation failed or user already exists
- `500` - Server error

---

### Login

Authenticates a user and returns access/refresh tokens.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "displayName": "Jane Doe",
    "role": "user"
  }
}
```

Sets HTTP-only cookies: `accessToken`, `refreshToken`

---

### Get Current User

Returns the authenticated user's information.

```http
GET /auth/me
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "displayName": "Jane Doe",
    "role": "user",
    "profileImage": "https://res.cloudinary.com/...",
    "bio": "Health enthusiast"
  }
}
```

---

### Logout

Logs out the current user.

```http
POST /auth/logout
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Refresh Token

Refreshes the access token using the refresh token.

```http
POST /auth/refresh
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

Updates `accessToken` and `refreshToken` cookies.

---

## Period Tracker Endpoints

### Create Period Entry

Logs a new period entry.

```http
POST /periods
```

**Request Body:**
```json
{
  "startDate": "2025-01-15",
  "endDate": "2025-01-20",
  "flow": "medium",
  "symptoms": ["cramps", "fatigue", "mood_swings"],
  "notes": "Feeling okay overall"
}
```

**Validation:**
- `startDate`: Required, ISO 8601 date string
- `endDate`: Required, ISO 8601 date string, must be after startDate
- `flow`: Optional, one of: `light`, `medium`, `heavy`
- `symptoms`: Optional, array of valid symptoms
- `notes`: Optional, max 500 characters

**Valid Symptoms:**
- `cramps`
- `bloating`
- `headache`
- `mood_swings`
- `fatigue`
- `nausea`
- `back_pain`
- `breast_tenderness`
- `acne`
- `food_cravings`

**Success Response (201):**
```json
{
  "success": true,
  "message": "Period entry created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "startDate": "2025-01-15T00:00:00.000Z",
    "endDate": "2025-01-20T00:00:00.000Z",
    "flow": "medium",
    "symptoms": ["cramps", "fatigue", "mood_swings"],
    "notes": "Feeling okay overall",
    "periodDuration": 6,
    "createdAt": "2025-01-24T10:00:00.000Z"
  }
}
```

---

### Get Period Entries

Retrieves user's period entries with pagination.

```http
GET /periods?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2025-01-20T00:00:00.000Z",
      "flow": "medium",
      "symptoms": ["cramps", "fatigue"],
      "notes": "Feeling okay",
      "periodDuration": 6,
      "createdAt": "2025-01-24T10:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 3,
    "total": 25
  }
}
```

---

### Get Cycle Insights

Returns AI-powered cycle predictions and insights.

```http
GET /periods/insights
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "averageCycleLength": 28,
    "averagePeriodLength": 5,
    "nextPredictedDate": "2025-02-12T00:00:00.000Z",
    "cycleRegularity": "regular",
    "totalCycles": 12,
    "insights": [
      "Your cycle is very regular!"
    ],
    "tips": [
      "💡 Great! Your regular cycle makes it easier to predict your next period",
      "💡 Your period length is within the typical range of 3-7 days"
    ],
    "cycleLengths": [28, 29, 27, 28],
    "periodDurations": [5, 6, 5, 5]
  }
}
```

**When insufficient data (< 2 entries):**
```json
{
  "success": true,
  "data": {
    "averageCycleLength": null,
    "averagePeriodLength": null,
    "nextPredictedDate": null,
    "cycleRegularity": "insufficient_data",
    "totalCycles": 1,
    "insights": ["Add more period entries to get cycle insights"],
    "tips": ["💡 Great start! Log at least one more period to see predictions"]
  }
}
```

---

### Update Period Entry

Updates an existing period entry.

```http
PUT /periods/:id
```

**Request Body:**
Same as Create Period Entry

**Success Response (200):**
```json
{
  "success": true,
  "message": "Period entry updated successfully",
  "data": { /* updated entry */ }
}
```

---

### Delete Period Entry

Deletes a period entry.

```http
DELETE /periods/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Period entry deleted successfully"
}
```

---

## Forum Endpoints

### Get All Posts

Retrieves forum posts with pagination and search.

```http
GET /posts?page=1&limit=10&search=wellness
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "displayName": "Jane Doe",
        "profileImage": "https://..."
      },
      "title": "First Time Tracking - Tips?",
      "content": "Just started using the period tracker...",
      "tags": ["beginners", "tips"],
      "likes": ["507f1f77bcf86cd799439013"],
      "replyCount": 5,
      "createdAt": "2025-01-24T10:00:00.000Z",
      "updatedAt": "2025-01-24T10:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 48
  }
}
```

---

### Create Post

Creates a new forum post.

```http
POST /posts
```

**Request Body:**
```json
{
  "title": "First Time Tracking - Tips?",
  "content": "Just started using the period tracker. Any tips for beginners?",
  "tags": ["beginners", "tips"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": { /* created post */ }
}
```

---

### Get Single Post

Retrieves a specific post with replies.

```http
GET /posts/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "post": { /* post data */ },
    "replies": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": {
          "displayName": "Sarah Smith",
          "profileImage": "https://..."
        },
        "content": "Great question! Here's what helped me...",
        "parentReplyId": null,
        "likes": [],
        "createdAt": "2025-01-24T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Add Reply

Adds a reply to a post or another reply.

```http
POST /posts/:postId/replies
```

**Request Body:**
```json
{
  "content": "Thanks for the advice!",
  "parentReplyId": "507f1f77bcf86cd799439013"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Reply added successfully",
  "data": { /* reply data */ }
}
```

---

### Like/Unlike Post

Toggles like on a post.

```http
POST /posts/:id/like
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Post liked successfully"
}
```

or

```json
{
  "success": true,
  "message": "Post unliked successfully"
}
```

---

## Review Endpoints

### Get Reviews

Retrieves reviews for an article or product.

```http
GET /reviews/:targetType/:targetId?page=1&limit=10
```

**Path Parameters:**
- `targetType`: `Article` or `Product`
- `targetId`: MongoDB ObjectId of the target

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "user": {
          "_id": "507f1f77bcf86cd799439012",
          "displayName": "Jane Doe",
          "profileImage": "https://..."
        },
        "rating": 5,
        "title": "Excellent article!",
        "comment": "Very informative and well-written",
        "helpful": ["507f1f77bcf86cd799439013"],
        "createdAt": "2025-01-24T10:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 2,
      "total": 15
    },
    "stats": {
      "averageRating": 4.5,
      "totalReviews": 15,
      "ratingDistribution": {
        "5": 10,
        "4": 3,
        "3": 2,
        "2": 0,
        "1": 0
      }
    }
  }
}
```

---

### Create/Update Review

Creates or updates a review.

```http
POST /reviews/:targetType/:targetId
```

**Request Body:**
```json
{
  "rating": 5,
  "title": "Excellent content!",
  "comment": "Very helpful and informative"
}
```

**Validation:**
- `rating`: Required, integer 1-5
- `title`: Required, max 100 characters
- `comment`: Required, max 1000 characters

**Success Response (201 or 200):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": { /* review data */ }
}
```

---

### Mark Review as Helpful

Toggles "helpful" vote on a review.

```http
POST /reviews/:id/helpful
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review marked as helpful"
}
```

---

### Delete Review

Deletes a review (own review or admin).

```http
DELETE /reviews/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Profile Endpoints

### Get Profile

Retrieves user's profile with stats.

```http
GET /profile
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "displayName": "Jane Doe",
      "role": "user",
      "profileImage": "https://res.cloudinary.com/...",
      "bio": "Health enthusiast and wellness advocate",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "stats": {
      "postsCount": 12,
      "articlesCount": 0,
      "periodEntriesCount": 24
    }
  }
}
```

---

### Update Profile

Updates user profile information.

```http
PUT /profile
Content-Type: multipart/form-data
```

**Form Data:**
- `displayName` (optional): String, max 50 characters
- `bio` (optional): String, max 500 characters
- `profileImage` (optional): File, max 10MB

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user */ }
}
```

---

### Change Password

Updates user's password.

```http
PUT /profile/password
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Delete Profile Image

Removes user's profile image.

```http
DELETE /profile/image
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile image deleted successfully"
}
```

---

### Delete Account

Permanently deletes user's account and all data.

```http
DELETE /profile/account
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## Admin Endpoints

All admin endpoints require `role: "admin"`.

### Get Dashboard Statistics

Retrieves platform-wide statistics with charts data.

```http
GET /admin/stats
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalPosts": 3420,
    "totalArticles": 87,
    "totalProducts": 45,
    "totalPeriodEntries": 15670,
    "userGrowth": [
      { "date": "2025-01-01", "users": 15 },
      { "date": "2025-01-02", "users": 23 }
    ],
    "contentGrowth": {
      "posts": [
        { "date": "2025-01-01", "count": 12 }
      ],
      "articles": [
        { "date": "2025-01-01", "count": 2 }
      ]
    },
    "userRoles": [
      { "role": "user", "count": 1245 },
      { "role": "admin", "count": 5 }
    ]
  }
}
```

---

### Get Recent Activity

Retrieves recent platform activity.

```http
GET /admin/activity
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "type": "New forum post: \"Tips for beginners\"",
      "timestamp": "2025-01-24T10:00:00.000Z",
      "category": "forum"
    },
    {
      "type": "New user user registered",
      "timestamp": "2025-01-24T09:45:00.000Z",
      "category": "user"
    }
  ]
}
```

---

### Get All Users

Retrieves all users with pagination and search.

```http
GET /admin/users?page=1&limit=10&search=jane
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "email": "jane@example.com",
        "displayName": "Jane Doe",
        "role": "user",
        "isActive": true,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "total": 125,
      "count": 1250
    }
  }
}
```

---

### Update User Role

Changes a user's role.

```http
PUT /admin/users/:id/role
```

**Request Body:**
```json
{
  "role": "admin"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User role updated successfully"
}
```

---

### Delete User

Permanently deletes a user and their data.

```http
DELETE /admin/users/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [ /* validation errors if applicable */ ]
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. Future versions will include:
- 100 requests per 15 minutes for authenticated users
- 20 requests per 15 minutes for unauthenticated users

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Response Format:**
```json
{
  "data": [ /* items */ ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 48
  }
}
```

---

## Date Formats

All dates use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

Example: `2025-01-24T10:30:00.000Z`

---

## File Uploads

File uploads use `multipart/form-data`:

**Supported Formats:**
- Images: JPEG, PNG, GIF, WebP
- Max Size: 10MB

**Cloudinary URLs:**
```
https://res.cloudinary.com/[cloud-name]/image/upload/v[version]/[public-id].[format]
```

---

For questions or issues, contact: singason65@gmail.com

