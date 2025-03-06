## Reviews Management Endpoints

### Get Reviews

```
GET /reviews
```

**Query Parameters:**
- `limit` (optional): Items per page (default: 10)
- `page` (optional): Page number (default: 1)
- `filter` (optional): Filter reviews (all, replied, notReplied)
- `sort` (optional): Sort order (date_desc, date_asc, rating_desc, rating_asc)

**Response:**

```json
{
  "reviews": [
    {
      "id": 30,
      "customer": {
        "id": 22,
        "name": "Nicole Taylor",
        "image": "url_to_image"
      },
      "rating": 5,
      "title": "Best photographer ever!",
      "review": "Amazing experience from start to finish. The photos were stunning!",
      "created_at": "2024-04-20T14:00:00Z",
      "service_type": "Family Session",
      "reply": "Thank you so much for your kind words, Nicole! It was a pleasure working with your family.",
      "reply_date": "2024-04-21T09:30:00Z"
    },
    // More reviews...
  ],
  "pagination": {
    "total": 45,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 5
  }
}
```

### Get Overall Rating

```
GET /reviews/rating
```

**Response:**

```json
{
  "rating": 4.8,
  "total_reviews": 45
}
```

### Get Review Details

```
GET /reviews/{id}
```

**Response:**

```json
{
  "id": 32,
  "customer": {
    "id": 24,
    "name": "Brian Wilson",
    "image": "url_to_image"
  },
  "rating": 4,
  "title": "Great engagement photos",
  "review": "We had a wonderful experience with our engagement photoshoot. Very professional and creative!",
  "created_at": "2024-04-18T16:45:00Z",
  "service_type": "Engagement Session",
  "reply": null,
  "reply_date": null
}
```

### Reply to Review

```
POST /reviews/{id}/reply
```

**Request Body:**

```json
{
  "reply": "Thank you for your feedback, Brian! I'm glad you enjoyed your engagement session and look forward to photographing your wedding next month."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Reply submitted successfully",
  "id": 32,
  "reply": "Thank you for your feedback, Brian! I'm glad you enjoyed your engagement session and look forward to photographing your wedding next month.",
  "reply_date": "2024-04-26T13:20:00Z"
}
```

## Availability Management Endpoints

### Get Working Hours

```
GET /availability/working-hours
```

**Response:**

```json
{
  "working_hours": [
    {
      "day": "monday",
      "is_available": true,
      "start_time": "09:00",
      "end_time": "17:00"
    },
    {
      "day": "tuesday",
      "is_available": true,
      "start_time": "09:00",
      "end_time": "17:00"
    },
    {
      "day": "wednesday",
      "is_available": true,
      "start_time": "09:00",
      "end_time": "17:00"
    },
    {
      "day": "thursday",
      "is_available": true,
      "start_time": "09:00",
      "end_time": "17:00"
    },
    {
      "day": "friday",
      "is_available": true,
      "start_time": "09:00",
      "end_time": "17:00"
    },
    {
      "day": "saturday",
      "is_available": true,
      "start_time": "10:00",
      "end_time": "15:00"
    },
    {
      "day": "sunday",
      "is_available": false,
      "start_time": null,
      "end_time": null
    }
  ]
}
```

### Update Working Hours

```
POST /availability/working-hours
```

**Request Body:**

```json
{
  "working_hours": [
    {
      "day": "monday",
      "is_available": true,
      "start_time": "10:00",
      "end_time": "18:00"
    },
    {
      "day": "tuesday",
      "is_available": true,
      "start_time": "10:00",
      "end_time": "18:00"
    },
    {
      "day": "wednesday",
      "is_available": true,
      "start_time": "10:00",
      "end_time": "18:00"
    },
    {
      "day": "thursday",
      "is_available": true,
      "start_time": "10:00",
      "end_time": "18:00"
    },
    {
      "day": "friday",
      "is_available": true,
      "start_time": "10:00",
      "end_time": "18:00"
    },
    {
      "day": "saturday",
      "is_available": true,
      "start_time": "09:00",
      "end_time": "16:00"
    },
    {
      "day": "sunday",
      "is_available": false,
      "start_time": null,
      "end_time": null
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Working hours updated successfully",
  "working_hours": [
    // Updated working hours...
  ]
}
```

### Get Special Dates

```
GET /availability/special-dates
```

**Query Parameters:**
- `month` (optional): Month (1-12)
- `year` (optional): Year (e.g., 2024)

**Response:**

```json
{
  "special_dates": [
    {
      "id": 5,
      "date": "2024-05-25",
      "is_available": false,
      "start_time": null,
      "end_time": null,
      "note": "Personal day"
    },
    {
      "id": 6,
      "date": "2024-05-30",
      "is_available": true,
      "start_time": "12:00",
      "end_time": "16:00",
      "note": "Limited availability"
    },
    // More special dates...
  ]
}
```

### Add Special Date

```
POST /availability/special-dates
```

**Request Body:**

```json
{
  "date": "2024-06-15",
  "is_available": false,
  "start_time": null,
  "end_time": null,
  "note": "Vacation day"
}
```

Or for custom hours:

```json
{
  "date": "2024-06-20",
  "is_available": true,
  "start_time": "14:00",
  "end_time": "18:00",
  "note": "Limited hours"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Special date added successfully",
  "id": 7,
  "date": "2024-06-15",
  "is_available": false,
  "start_time": null,
  "end_time": null,
  "note": "Vacation day"
}
```

### Delete Special Date

```
DELETE /availability/special-dates/{id}
```

**Response:**

```json
{
  "success": true,
  "message": "Special date deleted successfully"
}
```

## Messaging Endpoints

### Get Messages Count

```
GET /messages/count
```

**Query Parameters:**
- `unread` (optional): Get only unread messages count (true/false)

**Response:**

```json
{
  "count": 5
}
```

### Get Conversations

```
GET /messages/conversations
```

**Response:**

```json
{
  "conversations": [
    {
      "id": 12,
      "participant": {
        "id": 8,
        "name": "Emily Johnson",
        "image": "url_to_image",
        "role": "customer" // or "photographer" depending on who's requesting
      },
      "last_message": {
        "content": "Hi, I'm interested in booking a session next month",
        "timestamp": "2024-04-25T14:30:00Z",
        "is_read": false,
        "is_mine": false
      },
      "unread_count": 2
    },
    // More conversations...
  ]
}
```

### Get Conversation Messages

```
GET /messages/conversation/{id}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**

```json
{
  "conversation": {
    "id": 12,
    "participant": {
      "id": 8,
      "name": "Emily Johnson",
      "image": "url_to_image",
      "role": "customer"
    }
  },
  "messages": [
    {
      "id": 145,
      "content": "Hi, I'm interested in booking a session next month",
      "sender_id": 8,
      "is_mine": false,
      "timestamp": "2024-04-25T14:30:00Z",
      "is_read": true
    },
    {
      "id": 146,
      "content": "Hello Emily! Thanks for reaching out. What type of session are you looking for?",
      "sender_id": 3,
      "is_mine": true,
      "timestamp": "2024-04-25T15:45:00Z",
      "is_read": true
    },
    // More messages...
  ],
  "pagination": {
    "total": 10,
    "per_page": 20,
    "current_page": 1,
    "total_pages": 1
  }
}
```

### Send Message

```
POST /messages/send
```

**Request Body:**

```json
{
  "conversation_id": 12,
  "content": "I have availability on the 15th or 16th of next month if either works for you."
}
```

Or to start a new conversation:

```json
{
  "recipient_id": 8,
  "content": "Hello! I noticed you were interested in wedding photography services."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "message": {
    "id": 147,
    "content": "I have availability on the 15th or 16th of next month if either works for you.",
    "sender_id": 3,
    "is_mine": true,
    "timestamp": "2024-04-26T10:15:00Z",
    "is_read": false
  },
  "conversation_id": 12
}
```

### Mark Messages as Read

```
POST /messages/mark-as-read
```

**Request Body:**

```json
{
  "conversation_id": 12
}
```

**Response:**

```json
{
  "success": true,
  "message": "Messages marked as read",
  "updated_count": 2
}
```

## Settings Endpoints

### Get Account Settings

```
GET /settings/account
```

**Response:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "123 Main St, City",
  "email_notifications": true,
  "sms_notifications": false,
  "marketing_notifications": true
}
```

### Update Account Settings

```
PUT /settings/account
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "456 Oak St, City"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account settings updated successfully",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "456 Oak St, City"
}
```

### Get Notification Preferences

```
GET /settings/notifications
```

**Response:**

```json
{
  "email_notifications": true,
  "sms_notifications": false,
  "marketing_notifications": true,
  "booking_reminders": true,
  "message_notifications": true,
  "review_notifications": true
}
```

### Update Notification Preferences

```
PUT /settings/notifications
```

**Request Body:**

```json
{
  "email_notifications": true,
  "sms_notifications": true,
  "marketing_notifications": false,
  "booking_reminders": true,
  "message_notifications": true,
  "review_notifications": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "email_notifications": true,
  "sms_notifications": true,
  "marketing_notifications": false,
  "booking_reminders": true,
  "message_notifications": true,
  "review_notifications": true
}
```

### Change Password

```
PUT /settings/password
```

**Request Body:**

```json
{
  "current_password": "currentPassword123",
  "password": "newPassword456",
  "password_confirmation": "newPassword456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Get Privacy Settings (Photographer only)

```
GET /settings/privacy
```

**Response:**

```json
{
  "show_email": false,
  "show_phone": true,
  "show_location_details": false,
  "show_earnings_in_profile": false,
  "allow_reviews": true,
  "allow_booking_requests": true
}
```

### Update Privacy Settings (Photographer only)

```
PUT /settings/privacy
```

**Request Body:**

```json
{
  "show_email": false,
  "show_phone": true,
  "show_location_details": true,
  "show_earnings_in_profile": false,
  "allow_reviews": true,
  "allow_booking_requests": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Privacy settings updated successfully",
  "show_email": false,
  "show_phone": true,
  "show_location_details": true,
  "show_earnings_in_profile": false,
  "allow_reviews": true,
  "allow_booking_requests": true
}
```

### Get Payment Information (Photographer only)

```
GET /settings/payment
```

**Response:**

```json
{
  "payment_method": "bank_transfer",
  "bank_name": "Example Bank",
  "account_holder": "John Doe",
  "account_number": "****6789",
  "payment_schedule": "monthly"
}
```

### Update Payment Information (Photographer only)

```
PUT /settings/payment
```

**Request Body:**

```json
{
  "payment_method": "bank_transfer",
  "bank_name": "New Bank",
  "account_holder": "John Doe",
  "account_number": "1234567890",
  "payment_schedule": "bi_weekly"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment information updated successfully",
  "payment_method": "bank_transfer",
  "bank_name": "New Bank",
  "account_holder": "John Doe",
  "account_number": "****7890",
  "payment_schedule": "bi_weekly"
}
```

## File Upload Endpoints

### Upload Image

```
POST /uploads/images
```

**Request Body:**

```
Form data with 'image' file
```

**Response:**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "url": "url_to_uploaded_image"
}
```

## Categories Endpoints

### Get All Categories

```
GET /categories
```

**Response:**

```json
{
  "categories": [
    {
      "id": 1,
      "name": "Wedding",
      "slug": "wedding",
      "description": "Wedding photography services"
    },
    {
      "id": 2,
      "name": "Portrait",
      "slug": "portrait",
      "description": "Portrait photography services"
    },
    {
      "id": 3,
      "name": "Event",
      "slug": "event",
      "description": "Event photography services"
    },
    {
      "id": 4,
      "name": "Family",
      "slug": "family",
      "description": "Family photography services"
    },
    {
      "id": 5,
      "name": "Commercial",
      "slug": "commercial",
      "description": "Commercial photography services"
    }
  ]
}
```

## Services

### Get All Services (across all photographers)

```
GET /services
```

**Query Parameters:**

- `category` (optional): Filter by category (wedding, portrait, event, family, commercial)
- `limit` (optional): Items per page (default: 12)
- `page` (optional): Page number (default: 1)
- `sort` (optional): Sort order (price_asc, price_desc, newest, rating)
- `featured` (optional): Filter by featured status (true/false)

**Response:**

```json
{
  "services": [
    {
      "id": 5,
      "title": "Premium Wedding Coverage",
      "description": "Complete wedding day photography from preparation to reception",
      "short_description": "Full-day professional wedding photography",
      "price_range": "€1,200-€1,800",
      "duration": "8-10 hours",
      "category": "wedding",
      "image_url": "http://example.com/images/wedding-service.jpg",
      "photographer": {
        "id": 12,
        "name": "Emma Johnson",
        "profile_image": "http://example.com/photographers/emma.jpg",
        "rating": 4.9
      },
      "features": [
        "Second photographer included",
        "300+ edited photos",
        "Online gallery" 
      ]
    },
    // More services...
  ],
  "pagination": {
    "total": 85,
    "per_page": 12,
    "current_page": 1,
    "total_pages": 8
  }
}
```

### Get Service Details

```
GET /services/{id}
```

**Response:**

```json
{
  "service": {
    "id": 5,
    "title": "Premium Wedding Coverage",
    "description": "Our comprehensive wedding photography service includes everything you need to document your special day beautifully. From morning preparation through the ceremony and reception, we'll be there to capture every important moment.",
    "short_description": "Full-day professional wedding photography",
    "price_range": "€1,200-€1,800",
    "duration": "8-10 hours",
    "category": "wedding",
    "image_url": "http://example.com/images/wedding-service.jpg",
    "photographer": {
      "id": 12,
      "name": "Emma Johnson",
      "profile_image": "http://example.com/photographers/emma.jpg",
      "rating": 4.9,
      "specialization": "Wedding Photography",
      "location": "Berlin, Germany",
      "bio_excerpt": "Award-winning wedding photographer with 8+ years of experience"
    },
    "features": [
      "8-10 hours of coverage",
      "Second photographer",
      "Engagement session option",
      "300+ edited photos",
      "Online gallery",
      "Print release",
      "Wedding album options"
    ],
    "packages": [
      {
        "title": "Standard Package",
        "price": "€1,200",
        "description": "Our most popular wedding package",
        "features": [
          "8 hours coverage",
          "300 edited photos",
          "Online gallery with download"
        ]
      },
      {
        "title": "Deluxe Package",
        "price": "€1,800",
        "description": "Complete premium wedding coverage",
        "features": [
          "10 hours coverage",
          "Second photographer",
          "Engagement session",
          "500 edited photos",
          "Premium wedding album"
        ]
      }
    ]
  }
}
```

### Get Photographer's Services

```
GET /photographers/{id}/services
```

**Response:**

```json
{
  "photographer": {
    "id": 12,
    "name": "Emma Johnson",
    "profile_image": "http://example.com/photographers/emma.jpg"
  },
  "services": [
    {
      "id": 5,
      "title": "Premium Wedding Coverage",
      "short_description": "Full-day professional wedding photography",
      "price_range": "€1,200-€1,800",
      "duration": "8-10 hours",
      "category": "wedding",
      "image_url": "http://example.com/images/wedding-service.jpg"
    },
    {
      "id": 8,
      "title": "Engagement Session",
      "short_description": "Pre-wedding couple photoshoot",
      "price_range": "€350-€500",
      "duration": "2 hours",
      "category": "portrait",
      "image_url": "http://example.com/images/engagement-service.jpg"
    },
    // More services from this photographer...
  ]
}
```

This structure supports your marketplace model where each service is associated with a specific photographer while still allowing users to browse all services across photographers.

## Conclusion

This API documentation provides a comprehensive guide to implementing the LensLink platform's backend APIs, focusing on the customer and photographer dashboard functionality. The backend team should use this document as a reference for developing the required endpoints.

Key points to remember:
1. Maintain consistent authentication using Laravel Sanctum
2. Implement proper validation and error handling
3. Follow existing implementation patterns for new endpoints
4. Ensure proper relationship handling between models

For any questions or clarifications about this documentation, please contact the frontend team.
      # LensLink API Documentation

## Overview

This document outlines the API endpoints required for the LensLink platform, specifically focusing on the photographer and customer dashboard functionality. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

```
/api
```

## Authentication

All API requests (except for login, registration, and public photographer listings) require authentication using a Bearer token via Laravel Sanctum.

```
Authorization: Bearer {token}
```

## Common Response Structure

Responses follow various structures based on the endpoint. Most success responses include relevant data, while error responses typically include error messages.

## Existing Authentication Endpoints

### Login (IMPLEMENTED)

```
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**

```json
{
  "success": true,
  "token": "sanctum_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "phone": null,
    "profile_image": null,
    "bio": null,
    "created_at": "2023-01-15T00:00:00.000000Z",
    "updated_at": "2023-01-15T00:00:00.000000Z",
    "photographer_profile": {} // Only included if role is "photographer"
  }
}
```

### Register (IMPLEMENTED)

```
POST /auth/register
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password",
  "role": "customer" // or "photographer"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "updated_at": "2023-01-15T00:00:00.000000Z",
    "created_at": "2023-01-15T00:00:00.000000Z",
    "id": 1
  }
}
```

### Verify Token (IMPLEMENTED)

```
GET /auth/verify
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "phone": null,
    "profile_image": null,
    "bio": null,
    "created_at": "2023-01-15T00:00:00.000000Z",
    "updated_at": "2023-01-15T00:00:00.000000Z"
  }
}
```

### Logout (IMPLEMENTED)

```
POST /auth/logout
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## User Profile Endpoints

### Get User Profile (IMPLEMENTED)

```
GET /user/profile
```

Currently returns the authenticated user object directly.

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer", // or "photographer"
  "phone": "1234567890",
  "profile_image": "url_to_image",
  "bio": "User bio text",
  "created_at": "2023-01-15T00:00:00.000000Z",
  "updated_at": "2023-01-15T00:00:00.000000Z"
}
```

If the user is a photographer, the response also includes the photographer_profile relationship:

```json
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "photographer",
  "phone": "0987654321",
  "profile_image": "url_to_image",
  "bio": "Professional photographer with 10 years of experience",
  "created_at": "2023-02-20T00:00:00.000000Z",
  "updated_at": "2023-02-20T00:00:00.000000Z",
  "photographer_profile": {
    "id": 1,
    "user_id": 2,
    "specialization": "Wedding Photography",
    "experience_years": 10,
    "photoshoot_count": 150,
    "location": "New York, NY",
    "starting_price": 250,
    "banner_image": "url_to_banner",
    "featured": true,
    "verified": true,
    "average_rating": 4.8,
    "review_count": 45,
    "created_at": "2023-02-20T00:00:00.000000Z",
    "updated_at": "2023-02-20T00:00:00.000000Z"
  }
}
```

### Update User Profile

```
PUT /user/profile
```

**Request Body for Customers:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "123 Main St, City"
}
```

**Request Body for Photographers:**

```json
{
  "user": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "0987654321"
  },
  "profile": {
    "bio": "Professional photographer with 10 years of experience",
    "location": "New York, NY",
    "experience_years": 10,
    "specialization": "Wedding Photography",
    "category_ids": [1, 3]
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... } // Updated profile data
}
```

### Update Profile Image

```
POST /user/profile/image
```

**Request Body:**

```
Form data with 'image' file
```

**Response:**

```json
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "image_url": "url_to_new_image"
  }
}
```

## Customer Dashboard Endpoints

### Get Dashboard Data

```
GET /customer/dashboard
```

**Response:**

```json
{
  "success": true,
  "data": {
    "activeBookingsCount": 3,
    "completedSessionsCount": 12,
    "unreadMessagesCount": 5,
    "recentBookings": [
      {
        "id": 10,
        "photographer": {
          "id": 3,
          "name": "Emily Johnson",
          "image": "url_to_image"
        },
        "service": {
          "id": 5,
          "name": "Portrait Session"
        },
        "booking_date": "2024-05-15",
        "status": "confirmed",
        "total_amount": 250.00
      },
      // More bookings...
    ],
    "recommendedPhotographers": [
      {
        "id": 4,
        "name": "Michael Brown",
        "image": "url_to_image",
        "specialization": "Event Photography",
        "rating": 4.9,
        "bio": "Capturing special moments for over 8 years",
        "starting_price": 150.00
      },
      // More photographers...
    ]
  }
}
```

### Get Bookings

```
GET /bookings
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (all, pending, confirmed, completed, cancelled)
- `search` (optional): Search term

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": 12,
        "photographer": {
          "id": 5,
          "name": "Robert Davis",
          "image": "url_to_image"
        },
        "service": {
          "id": 8,
          "name": "Wedding Package"
        },
        "booking_date": "2024-06-22",
        "start_time": "10:00",
        "end_time": "14:00",
        "location": "Central Park, NY",
        "status": "confirmed",
        "total_amount": 1200.00
      },
      // More bookings...
    ],
    "pagination": {
      "total": 25,
      "per_page": 10,
      "current_page": 1,
      "total_pages": 3
    }
  }
}
```

### Get Booking Count

```
GET /bookings/count
```

**Query Parameters:**
- `status` (required): Booking status (pending, confirmed, completed, cancelled)

**Response:**

```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

### Get Booking Details

```
GET /bookings/{id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 15,
    "photographer": {
      "id": 6,
      "name": "Sarah Wilson",
      "image": "url_to_image"
    },
    "service": {
      "id": 12,
      "name": "Family Portrait Session",
      "description": "Capture beautiful family moments in a natural setting",
      "features": [
        "1-hour photoshoot",
        "10 edited digital photos",
        "Online gallery"
      ]
    },
    "booking_date": "2024-05-30",
    "start_time": "15:00",
    "end_time": "16:00",
    "location": "Riverside Park, NY",
    "status": "confirmed",
    "total_amount": 350.00,
    "notes": "Looking for natural light photos in an outdoor setting",
    "created_at": "2024-04-15T08:30:00Z"
  }
}
```

### Cancel Booking

```
PUT /bookings/{id}/cancel
```

**Response:**

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": 15,
    "status": "cancelled"
  }
}
```

### Get Recommended Photographers

```
GET /photographers/recommended
```

**Query Parameters:**
- `limit` (optional): Number of photographers to return (default: 3)

**Response:**

```json
{
  "success": true,
  "data": {
    "photographers": [
      {
        "id": 8,
        "name": "Thomas Lee",
        "image": "url_to_image",
        "specialization": "Portrait Photography",
        "rating": 4.7,
        "bio": "Specializing in creating timeless portrait images",
        "starting_price": 120.00
      },
      // More photographers...
    ]
  }
}
```

### Get Saved Photographers

```
GET /saved-photographers
```

**Response:**

```json
{
  "success": true,
  "data": {
    "photographers": [
      {
        "id": 10,
        "name": "Jennifer Adams",
        "image": "url_to_image",
        "specialization": "Family Photography",
        "rating": 4.8,
        "saved_at": "2024-04-10T14:22:00Z"
      },
      // More photographers...
    ]
  }
}
```

### Save/Unsave Photographer

```
POST /saved-photographers/toggle
```

**Request Body:**

```json
{
  "photographer_id": 10
}
```

**Response:**

```json
{
  "success": true,
  "message": "Photographer saved successfully", // or "Photographer removed from saved list"
  "data": {
    "is_saved": true // or false if removed
  }
}
```

## Photographer Dashboard Endpoints

### Get Dashboard Data

```
GET /photographer/dashboard
```

**Response:**

```json
{
  "success": true,
  "data": {
    "pendingOrdersCount": 5,
    "activeOrdersCount": 8,
    "monthlyEarnings": 2500.00,
    "overallRating": 4.8,
    "recentBookings": [
      {
        "id": 20,
        "client": {
          "id": 15,
          "name": "David Miller"
        },
        "service": {
          "id": 4,
          "name": "Engagement Session"
        },
        "booking_date": "2024-05-18",
        "status": "confirmed",
        "total_amount": 350.00
      },
      // More bookings...
    ],
    "recentReviews": [
      {
        "id": 25,
        "customer": {
          "id": 18,
          "name": "Lisa Johnson",
          "image": "url_to_image"
        },
        "rating": 5,
        "title": "Amazing work!",
        "review": "Incredibly professional and captured exactly what we wanted.",
        "created_at": "2024-04-10T09:15:00Z",
        "service_type": "Wedding Photography",
        "reply": null,
        "reply_date": null
      },
      // More reviews...
    ]
  }
}
```

### Get Earnings Data

```
GET /earnings/monthly
```

**Response:**

```json
{
  "success": true,
  "data": {
    "amount": 2500.00
  }
}
```

### Get Earnings Chart Data

```
GET /earnings/chart
```

**Query Parameters:**
- `days` (optional): Number of days to include (default: 180)

**Response:**

```json
{
  "success": true,
  "data": {
    "labels": ["Nov 2023", "Dec 2023", "Jan 2024", "Feb 2024", "Mar 2024", "Apr 2024"],
    "values": [1800.00, 2200.00, 1500.00, 1900.00, 2300.00, 2500.00]
  }
}
```

### Get Portfolio Items

```
GET /portfolio
```

**Query Parameters:**
- `category` (optional): Filter by category (wedding, portrait, event, family, commercial)

**Response:**

```json
{
  "success": true,
  "data": {
    "portfolioItems": [
      {
        "id": 10,
        "title": "Spring Wedding Collection",
        "image": "url_to_image",
        "category": "wedding",
        "description": "A beautiful spring wedding in Central Park",
        "featured": true,
        "created_at": "2024-03-15T10:00:00Z"
      },
      // More portfolio items...
    ]
  }
}
```

### Add Portfolio Item

```
POST /portfolio
```

**Request Body:**

```json
{
  "title": "Summer Portrait Session",
  "category_id": 2,
  "description": "Beach portrait photography session",
  "image_path": "url_to_image", // Obtained from uploading the image first
  "featured": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Portfolio item added successfully",
  "data": {
    "id": 12,
    "title": "Summer Portrait Session",
    "image": "url_to_image",
    "category": "portrait",
    "description": "Beach portrait photography session",
    "featured": false,
    "created_at": "2024-04-25T14:30:00Z"
  }
}
```

### Update Portfolio Item

```
PUT /portfolio/{id}
```

**Request Body:**

```json
{
  "title": "Updated Title",
  "category_id": 2,
  "description": "Updated description",
  "featured": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Portfolio item updated successfully",
  "data": {
    "id": 12,
    "title": "Updated Title",
    "image": "url_to_image",
    "category": "portrait",
    "description": "Updated description",
    "featured": true,
    "updated_at": "2024-04-26T09:15:00Z"
  }
}
```

### Delete Portfolio Item

```
DELETE /portfolio/{id}
```

**Response:**

```json
{
  "success": true,
  "message": "Portfolio item deleted successfully"
}
```

### Get Services

```
GET /services
```

**Response:**

```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": 5,
        "name": "Standard Wedding Package",
        "description": "Full day wedding photography coverage",
        "price": 1800.00,
        "unit": "package",
        "duration": 480,
        "is_featured": true,
        "features": [
          "8 hours of coverage",
          "Second photographer",
          "Online gallery",
          "100 edited digital photos"
        ]
      },
      // More services...
    ]
  }
}
```

### Add Service

```
POST /services
```

**Request Body:**

```json
{
  "name": "Mini Portrait Session",
  "description": "Quick 30-minute portrait session, perfect for headshots",
  "price": 150.00,
  "unit": "session",
  "duration": 30,
  "is_featured": false,
  "features": [
    "30-minute session",
    "5 edited digital photos",
    "Online gallery",
    "1 outfit change"
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Service added successfully",
  "data": {
    "id": 8,
    "name": "Mini Portrait Session",
    "description": "Quick 30-minute portrait session, perfect for headshots",
    "price": 150.00,
    "unit": "session",
    "duration": 30,
    "is_featured": false,
    "features": [
      "30-minute session",
      "5 edited digital photos",
      "Online gallery",
      "1 outfit change"
    ],
    "created_at": "2024-04-26T10:45:00Z"
  }
}
```

### Update Service

```
PUT /services/{id}
```

**Request Body:**

```json
{
  "name": "Updated Mini Portrait Session",
  "description": "Updated description",
  "price": 175.00,
  "is_featured": true,
  "features": [
    "30-minute session",
    "7 edited digital photos",
    "Online gallery",
    "1 outfit change",
    "Express delivery (24h)"
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "id": 8,
    "name": "Updated Mini Portrait Session",
    "description": "Updated description",
    "price": 175.00,
    "unit": "session",
    "duration": 30,
    "is_featured": true,
    "features": [
      "30-minute session",
      "7 edited digital photos",
      "Online gallery",
      "1 outfit change",
      "Express delivery (24h)"
    ],
    "updated_at": "2024-04-26T11:30:00Z"
  }
}
```

### Delete Service

```
DELETE /services/{id}
```

**Response:**

```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

### Get Reviews

```
GET /reviews
```

**Query Parameters:**
- `limit` (optional): Items per page (default: 10)
- `page` (optional): Page number (default: 1)
- `filter` (optional): Filter reviews (all, replied, notReplied)
- `sort` (optional): Sort order (date_desc, date_asc, rating_desc, rating_asc)

**Response:**

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 30,
        "customer": {
          "id": 22,
          "name": "Nicole Taylor",
          "image": "url_to_image"
        },
        "rating": 5,
        "title": "Best photographer ever!",
        "review": "Amazing experience from start to finish. The photos were stunning!",
        "created_at": "2024-04-20T14:00:00Z",
        "service_type": "Family Session",
        "reply": "Thank you so much for your kind words, Nicole! It was a pleasure working with your family.",
        "reply_date": "2024-04-21T09:30:00Z"
      },
      // More reviews...
    ],
    "pagination": {
      "total": 45,
      "per_page": 10,
      "current_page": 1,
      "total_pages": 5
    }
  }
}
```

### Get Overall Rating

```
GET /reviews/rating
```

**Response:**

```json
{
  "success": true,
  "data": {
    "rating": 4.8,
    "total_reviews": 45
  }
}
```

### Get Review Details

```
GET /reviews/{id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 32,
    "customer": {
      "id": 24,
      "name": "Brian Wilson",
      "image": "url_to_image"
    },
    "rating": 4,
    "title": "Great engagement photos",
    "review": "We had a wonderful experience with our engagement photoshoot. Very professional and creative!",
    "created_at": "2024-04-18T16:45:00Z",
    "service_type": "Engagement Session",
    "reply": null,
    "reply_date": null
  }
}
```

### Reply to Review

```
POST /reviews/{id}/reply
```

**Request Body:**

```json
{
  "reply": "Thank you for your feedback, Brian! I'm glad you enjoyed your engagement session and look forward to photographing your wedding next month."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Reply submitted successfully",
  "data": {
    "id": 32,
    "reply": "Thank you for your feedback, Brian! I'm glad you enjoyed your engagement session and look forward to photographing your wedding next month.",
    "reply_date": "2024-04-26T13:20:00Z"
  }
}
```

### Get Availability

```
GET /availability/working-hours
```

**Response:**

```json
{
  "success": true,
  "data": {
    "working_hours": [
      {
        "day": "monday",
        "is_available": true,
        "start_time": "09:00",
        "end_time": "17:00"
      },
      {
        "day": "tuesday",
        "is_available": true,
        "start_time": "09:00",
        "end_time": "17:00"
      },
      {
        "day": "wednesday",
        "is_available": true,
        "start_time": "09:00",
        "end_time": "17:00"
      },
      {
        "day": "thursday",
        "is_available": true,
        "start_time": "09:00",
        "end_time": "17:00"
      },
      {
        "day": "friday",
        "is_available": true,
        "start_time": "09:00",
        "end_time": "17:00"
      },
      {
        "day": "saturday",
        "is_available": true,
        "start_time": "10:00",
        "end_time": "15:00"
      },
      {
        "day": "sunday",
        "is_available": false,
        "start_time": null,
        "end_time": null
      }
    ]
  }
}
```

### Update Working Hours

```
POST /availability/working-hours
```

**Request Body:**

```json
{
  "working_hours": [
    {
      "day": "monday",
      "is_available": true,
      "start_time": "10:00",
      "end_time": "18:00"
    },
    {
      "day": "tuesday",
      "is_available": true,
      "start_time": "10:00",
      "end_time": "18:00"
    },
    {
      "day": "wednesday",
      "is_available": true,
      "start_time": "10:00",
      "end_time": "18:00"
    },
    {
      "day": "thursday",
      "is_available": true,
      "start_time": "10:00",
      "end_time": "18:00"
    },
    {
      "day": "friday",
      "is_available": true,
      "start_time": "10:00",
      "end_time": "18:00"
    },
    {
      "day": "saturday",
      "is_available": true,
      "start_time": "09:00",
      "end_time": "16:00"
    },
    {
      "day": "sunday",
      "is_available": false,
      "start_time": null,
      "end_time": null
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Working hours updated successfully",
  "data": {
    "working_hours": [
      // Updated working hours...
    ]
  }
}
```

### Get Special Dates

```
GET /availability/special-dates
```

**Query Parameters:**
- `month` (optional): Month (1-12)
- `year` (optional): Year (e.g., 2024)

**Response:**

```json
{
  "success": true,
  "data": {
    "special_dates": [
      {
        "id": 5,
        "date": "2024-05-25",
        "is_available": false,
        "start_time": null,
        "end_time": null,
        "note": "Personal day"
      },
      {
        "id": 6,
        "date": "2024-05-30",
        "is_available": true,
        "start_time": "12:00",
        "end_time": "16:00",
        "note": "Limited availability"
      },
      // More special dates...
    ]
  }
}
```

### Add Special Date

```
POST /availability/special-dates
```

**Request Body:**

```json
{
  "date": "2024-06-15",
  "is_available": false,
  "start_time": null,
  "end_time": null,
  "note": "Vacation day"
}
```

Or for custom hours:

```json
{
  "date": "2024-06-20",
  "is_available": true,
  "start_time": "14:00",
  "end_time": "18:00",
  "note": "Limited hours"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Special date added successfully",
  "data": {
    "id": 7,
    "date": "2024-06-15",
    "is_available": false,
    "start_time": null,
    "end_time": null,
    "note": "Vacation day"
  }
}
```

### Delete Special Date

```
DELETE /availability/special-dates/{id}
```

**Response:**

```json
{
  "success": true,
  "message": "Special date deleted successfully"
}
```

## Messaging Endpoints

### Get Messages Count

```
GET /messages/count
```

**Query Parameters:**
- `unread` (optional): Get only unread messages count (true/false)

**Response:**

```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### Get Conversations

```
GET /messages/conversations
```

**Response:**

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 12,
        "participant": {
          "id": 8,
          "name": "Emily Johnson",
          "image": "url_to_image",
          "role": "customer" // or "photographer" depending on who's requesting
        },
        "last_message": {
          "content": "Hi, I'm interested in booking a session next month",
          "timestamp": "2024-04-25T14:30:00Z",
          "is_read": false,
          "is_mine": false
        },
        "unread_count": 2
      },
      // More conversations...
    ]
  }
}
```

### Get Conversation Messages

```
GET /messages/conversation/{id}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": 12,
      "participant": {
        "id": 8,
        "name": "Emily Johnson",
        "image": "url_to_image",
        "role": "customer"
      }
    },
    "messages": [
      {
        "id": 145,
        "content": "Hi, I'm interested in booking a session next month",
        "sender_id": 8,
        "is_mine": false,
        "timestamp": "2024-04-25T14:30:00Z",
        "is_read": true
      },
      {
        "id": 146,
        "content": "Hello Emily! Thanks for reaching out. What type of session are you looking for?",
        "sender_id": 3,
        "is_mine": true,
        "timestamp": "2024-04-25T15:45:00Z",
        "is_read": true
      },
      // More messages...
    ],
    "pagination": {
      "total": 10,
      "per_page": 20,
      "current_page": 1,
      "total_pages": 1
    }
  }
}
```

### Send Message

```
POST /messages/send
```

**Request Body:**

```json
{
  "conversation_id": 12,
  "content": "I have availability on the 15th or 16th of next month if either works for you."
}
```

Or to start a new conversation:

```json
{
  "recipient_id": 8,
  "content": "Hello! I noticed you were interested in wedding photography services."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "id": 147,
      "content": "I have availability on the 15th or 16th of next month if either works for you.",
      "sender_id": 3,
      "is_mine": true,
      "timestamp": "2024-04-26T10:15:00Z",
      "is_read": false
    },
    "conversation_id": 12
  }
}
```

### Mark Messages as Read

```
POST /messages/mark-as-read
```

**Request Body:**

```json
{
  "conversation_id": 12
}
```

**Response:**

```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "updated_count": 2
  }
}
```

## File Upload Endpoints

### Upload Image

```
POST /uploads/images
```

**Request Body:**

```
Form data with 'image' file
```

**Response:**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "url_to_uploaded_image"
  }
}
```

## Settings Endpoints

### Get Account Settings

```
GET /settings/account
```

**Response:**

```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St, City",
    "email_notifications": true,
    "sms_notifications": false,
    "marketing_notifications": true
  }
}
```

### Update Account Settings

```
PUT /settings/account
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "456 Oak St, City"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account settings updated successfully",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "456 Oak St, City"
  }
}
```

### Get Notification Preferences

```
GET /settings/notifications
```

**Response:**

```json
{
  "success": true,
  "data": {
    "email_notifications": true,
    "sms_notifications": false,
    "marketing_notifications": true,
    "booking_reminders": true,
    "message_notifications": true,
    "review_notifications": true
  }
}
```

### Update Notification Preferences

```
PUT /settings/notifications
```

**Request Body:**

```json
{
  "email_notifications": true,
  "sms_notifications": true,
  "marketing_notifications": false,
  "booking_reminders": true,
  "message_notifications": true,
  "review_notifications": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "email_notifications": true,
    "sms_notifications": true,
    "marketing_notifications": false,
    "booking_reminders": true,
    "message_notifications": true,
    "review_notifications": true
  }
}
```

### Change Password

```
PUT /settings/password
```

**Request Body:**

```json
{
  "current_password": "currentPassword123",
  "password": "newPassword456",
  "password_confirmation": "newPassword456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Get Privacy Settings (Photographer only)

```
GET /settings/privacy
```

**Response:**

```json
{
  "success": true,
  "data": {
    "show_email": false,
    "show_phone": true,
    "show_location_details": false,
    "show_earnings_in_profile": false,
    "allow_reviews": true,
    "allow_booking_requests": true
  }
}
```

### Update Privacy Settings (Photographer only)

```
PUT /settings/privacy
```

**Request Body:**

```json
{
  "show_email": false,
  "show_phone": true,
  "show_location_details": true,
  "show_earnings_in_profile": false,
  "allow_reviews": true,
  "allow_booking_requests": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Privacy settings updated successfully",
  "data": {
    "show_email": false,
    "show_phone": true,
    "show_location_details": true,
    "show_earnings_in_profile": false,
    "allow_reviews": true,
    "allow_booking_requests": true
  }
}
```

### Get Payment Information (Photographer only)

```
GET /settings/payment
```

**Response:**

```json
{
  "success": true,
  "data": {
    "payment_method": "bank_transfer",
    "bank_name": "Example Bank",
    "account_holder": "John Doe",
    "account_number": "****6789",
    "payment_schedule": "monthly"
  }
}
```

### Update Payment Information (Photographer only)

```
PUT /settings/payment
```

**Request Body:**

```json
{
  "payment_method": "bank_transfer",
  "bank_name": "New Bank",
  "account_holder": "John Doe",
  "account_number": "1234567890",
  "payment_schedule": "bi_weekly"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment information updated successfully",
  "data": {
    "payment_method": "bank_transfer",
    "bank_name": "New Bank",
    "account_holder": "John Doe",
    "account_number": "****7890",
    "payment_schedule": "bi_weekly"
  }
}
```

## Categories Endpoints

### Get All Categories

```
GET /categories
```

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Wedding",
        "slug": "wedding",
        "description": "Wedding photography services"
      },
      {
        "id": 2,
        "name": "Portrait",
        "slug": "portrait",
        "description": "Portrait photography services"
      },
      {
        "id": 3,
        "name": "Event",
        "slug": "event",
        "description": "Event photography services"
      },
      {
        "id": 4,
        "name": "Family",
        "slug": "family",
        "description": "Family photography services"
      },
      {
        "id": 5,
        "name": "Commercial",
        "slug": "commercial",
        "description": "Commercial photography services"
      }
    ]
  }
}
```

## Existing Data Models and Relationships

The following models have already been implemented:

### User (IMPLEMENTED)
```php
protected $fillable = [
    'name',
    'email',
    'password',
    'role',
    'phone',
    'profile_image',
    'bio'
];
```

Relationships:
- Has one photographer_profile (if role is 'photographer')
- Methods: isPhotographer(), isCustomer()

### PhotographerProfile (IMPLEMENTED)
```php
protected $fillable = [
    'user_id',
    'specialization',
    'experience_years',
    'photoshoot_count',
    'location',
    'starting_price',
    'banner_image',
    'featured',
    'verified',
    'average_rating',
    'review_count',
];
```

Relationships:
- Belongs to one user
- Has many portfolio_items (as photographer_id)
- Has many services (as photographer_id)
- Belongs to many categories (through photographer_categories)
- Has many reviews (as photographer_id)

### Category (IMPLEMENTED)
```php
protected $fillable = [
    'name',
    'slug',
    'description'
];
```

Relationships:
- Belongs to many photographers (through photographer_categories)
- Has many portfolio_items

### PortfolioItem (IMPLEMENTED)
```php
protected $fillable = [
    'photographer_id',
    'title',
    'description',
    'image_path',
    'category_id',
    'featured',
    'sort_order'
];
```

Relationships:
- Belongs to photographer (PhotographerProfile)
- Belongs to category

### Service (IMPLEMENTED)
```php
protected $fillable = [
    'photographer_id',
    'name',
    'description',
    'price',
    'duration',
    'unit',
    'is_featured',
    'is_active'
];
```

Relationships:
- Belongs to photographer (PhotographerProfile)
- Has many features (ServiceFeature)

### ServiceFeature (IMPLEMENTED)
```php
protected $fillable = [
    'service_id',
    'feature',
    'sort_order'
];
```

Relationships:
- Belongs to service

## Additional Models Needed

### Booking
- Relationships with customer (User), photographer (User), and service

### Review
- Relationships with customer (User), photographer (User or PhotographerProfile), and booking (optional)

### Message and Conversation
- For handling messaging between users

### Favorite/SavedPhotographer
- For handling customer's saved photographers

## Database Schema

Based on your database screenshot, the following tables exist:
- users
- photographer_profiles
- categories
- photographer_categories
- portfolio_items
- services
- service_features
- bookings
- reviews
- messages
- conversations
- conversation_participants
- favorites

## Implementation Recommendations

### Existing Implementation Patterns

1. **Authentication & Authorization**: 
   - Laravel Sanctum is already set up for API authentication
   - Role-based access control is implemented through User model methods

2. **Response Structure**:
   - Your current controllers use varied response formats
   - The PhotographerController returns direct data objects with pagination

3. **Query Building**:
   - The PhotographerController shows a good pattern for building complex queries
   - Filtering, sorting, and search functionality is already implemented

### Additional Implementation Recommendations

1. **Controllers to Implement**:
   - BookingController
   - ReviewController
   - MessageController
   - PortfolioController
   - ServiceController
   - UserProfileController
   - SettingsController

2. **File Storage**:
   - Use Laravel's Storage facade with public disk for images
   - Implement image compression and resizing

3. **Data Validation**:
   - Create form requests for each endpoint to validate input
   - Implement comprehensive validation rules

4. **Error Handling**:
   - Use Laravel's exception handler
   - Return appropriate HTTP status codes and error messages

5. **Database Considerations**:
   - Use eager loading to prevent N+1 query issues (already shown in your PhotographerController)
   - Implement indexes on frequently queried columns
   - Use transactions for operations that affect multiple tables (as done in your AuthController)

## Current API Routes (IMPLEMENTED)

```php
// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/photographers', [PhotographerController::class, 'index']);
Route::get('/photographers/{id}', [PhotographerController::class, 'show']);

// Private routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/verify', [AuthController::class, 'verify']);
    
    Route::get('/user/profile', function () {
        return auth()->user();
    });
});
```

## Required Additional Routes

These routes need to be added to support the dashboard functionality:

```php
Route::middleware('auth:sanctum')->group(function () {
    // Customer dashboard
    Route::get('/customer/dashboard', [CustomerDashboardController::class, 'index']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/count', [BookingController::class, 'getCount']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::put('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    Route::get('/photographers/recommended', [PhotographerController::class, 'getRecommended']);
    Route::get('/saved-photographers', [PhotographerController::class, 'getSaved']);
    Route::post('/saved-photographers/toggle', [PhotographerController::class, 'toggleSave']);
    
    // Photographer dashboard
    Route::get('/photographer/dashboard', [PhotographerDashboardController::class, 'index']);
    Route::get('/earnings/monthly', [EarningsController::class, 'getMonthly']);
    Route::get('/earnings/chart', [EarningsController::class, 'getChart']);
    
    // Portfolio management
    Route::apiResource('portfolio', PortfolioController::class);
    
    // Services management
    Route::apiResource('services', ServiceController::class);
    
    // Reviews
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::get('/reviews/rating', [ReviewController::class, 'getOverallRating']);
    Route::get('/reviews/{id}', [ReviewController::class, 'show']);
    Route::post('/reviews/{id}/reply', [ReviewController::class, 'reply']);
    
    // Availability
    Route::prefix('availability')->group(function () {
        Route::get('/working-hours', [AvailabilityController::class, 'getWorkingHours']);
        Route::post('/working-hours', [AvailabilityController::class, 'saveWorkingHours']);
        Route::get('/special-dates', [AvailabilityController::class, 'getSpecialDates']);
        Route::post('/special-dates', [AvailabilityController::class, 'saveSpecialDate']);
        Route::delete('/special-dates/{id}', [AvailabilityController::class, 'deleteSpecialDate']);
    });
    
    // Messaging
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index']);
        Route::get('/count', [MessageController::class, 'getCount']);
        Route::get('/conversations', [MessageController::class, 'getConversations']);
        Route::get('/conversation/{id}', [MessageController::class, 'getConversation']);
        Route::post('/send', [MessageController::class, 'send']);
        Route::post('/mark-as-read', [MessageController::class, 'markAsRead']);
    });
    
    // Settings
    Route::prefix('settings')->group(function () {
        Route::get('/account', [SettingsController::class, 'getAccount']);
        Route::put('/account', [SettingsController::class, 'updateAccount']);
        Route::get('/notifications', [SettingsController::class, 'getNotifications']);
        Route::put('/notifications', [SettingsController::class, 'updateNotifications']);
        Route::put('/password', [SettingsController::class, 'changePassword']);
        Route::get('/privacy', [SettingsController::class, 'getPrivacy']);
        Route::put('/privacy', [SettingsController::class, 'updatePrivacy']);
        Route::get('/payment', [SettingsController::class, 'getPayment']);
        Route::put('/payment', [SettingsController::class, 'updatePayment']);
    });
    
    // File uploads
    Route::post('/uploads/images', [UploadController::class, 'uploadImage']);
});
```

## Example Controller Implementation (BookingController)

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\
```

## 
