# Interfaces

---

1.  `/auth`
```json
POST /auth/login
Request: {
    "email": "string",
    "password": "string"
}
Response: {
    "success": true,
    "token": "string",
    "user": {
        "id": "number",
        "name": "string",
        "email": "string",
        "role": "customer | photographer"
    }
}

POST /auth/register
Request: {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "customer | photographer"
}
Response: {
    "success": true,
    "message": "string"
}

POST /auth/logout
Request: Headers: { "Authorization": "Bearer token" }
Response: {
    "success": true
}
```

2.  `/user`
```json
GET /user/profile
Headers: { "Authorization": "Bearer token" }
Response: {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "customer | photographer",
    "avatar": "string",
    "createdAt": "date"
}

PUT /user/profile
Headers: { "Authorization": "Bearer token" }
Request: {
    "name": "string",
    "avatar": "string"
}
Response: {
    "success": true
}
```

3.  `/photographers`
```json
GET /photographers
Query Parameters: {
    "search": "string",        // Optional, search keywords
    "category": "string",      // Optional, categorised filter
    "page": "number",         // Optional, page number
    "limit": "number"         // Optional, number limit in each page
}
Response: {
    "photographers": [{
        "id": "number",
        "name": "string",
        "specialization": "string",
        "description": "string",
        "image": "string",
        "rating": "number",
        "reviewCount": "number",
        "startingPrice": "number",
        "categories": ["string"]
    }],
    "pagination": {
        "currentPage": "number",
        "totalPages": "number",
        "totalItems": "number"
    }
}

GET /photographers/{id}
Response: {
    "id": "number",
    "name": "string",
    "specialization": "string",
    "description": "string",
    "image": "string",
    "rating": "number",
    "reviewCount": "number",
    "location": "string",
    "experience": "number",
    "completedShoots": "number",
    "services": [{
        "id": "number",
        "name": "string",
        "description": "string",
        "price": "number",
        "duration": "number"
    }],
    "portfolio": [{
        "id": "number",
        "image": "string",
        "category": "string"
    }],
    "reviews": [{
        "id": "number",
        "rating": "number",
        "comment": "string",
        "userImage": "string",
        "userName": "string",
        "createdAt": "date"
    }]
}
```

4. `/categories`
```json
GET /categories
Response: {
    "categories": [{
        "id": "number",
        "name": "string",
        "count": "number"  // Number of photographers under this category
    }]
}
```

Tips：
1.  `Authorization: Bearer {token}` is optional
2. All responses should contain the appropriate HTTP status codes
3. Error Response Format：
```json
{
    "success": false,
    "error": {
        "code": "string",
        "message": "string"
    }
}
```

