# Truvista Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Caching & Performance](#caching--performance)
7. [Configuration](#configuration)
8. [Security](#security)

## Overview

This documentation provides comprehensive information about the Truvista backend API, which is built using Spring Boot. The API follows RESTful principles and implements JWT-based authentication with OTP verification.

## Authentication

### Authentication Flow
1. **OTP Generation**
   - Endpoint: `POST /api/auth/start`
   - Request Body:
     ```json
     {
       "contactNo": "string"
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "data": "string",
       "message": "OTP sent successfully. User status: string"
     }
     ```

2. **OTP Verification**
   - Endpoint: `POST /api/auth/verify-otp`
   - Request Body:
     ```json
     {
       "contactNo": "string",
       "otp": "string"
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "data": "string",
       "message": "OTP verified successfully. User status: string"
     }
     ```

3. **Sign Up**
   - Endpoint: `POST /api/auth/signup`
   - Request Body:
     ```json
     {
       "contactNo": "string",
       "name": "string",
       "email": "string"
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "data": {
         "jwt": "string",
         "userId": "number",
         "role": "string",
         "message": "User registered successfully"
       }
     }
     ```

4. **Sign In**
   - Endpoint: `POST /api/auth/signin`
   - Request Body:
     ```json
     {
       "contactNo": "string"
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "data": {
         "jwt": "string",
         "userId": "number",
         "role": "string",
         "message": "User authenticated successfully"
       }
     }
     ```

### JWT Token Usage
- Include the JWT token in the Authorization header:
  ```
  Authorization: Bearer <jwt_token>
  ```
- Token expiration: 24 hours (86400000 ms)

## API Endpoints

### Property Management
- `GET /api/properties` - List all properties
- `GET /api/properties/{id}` - Get property details
- `POST /api/properties` - Create new property (Admin only)
- `PUT /api/properties/{id}` - Update property (Admin only)
- `DELETE /api/properties/{id}` - Delete property (Admin only)

### Booking Management
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List user's bookings
- `GET /api/bookings/{id}` - Get booking details
- `PUT /api/bookings/{id}` - Update booking status

### Shortlist Management
- `POST /api/shortlist` - Add property to shortlist
- `GET /api/shortlist` - Get user's shortlist
- `DELETE /api/shortlist/{id}` - Remove from shortlist

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/bookings` - Get user's booking history

### Admin Management
- Base URL: `/api/admin`
- Required Role: ADMIN or EXECUTIVE

#### Property Management
- `POST /api/admin/properties` - Create new property
  - Request Body: CreatePropertyDTO
  - Response: Property entity
- `GET /api/admin/properties` - List all properties
- `GET /api/admin/properties/{id}` - Get property details
- `PUT /api/admin/properties/{id}` - Update property
  - Request Body: UpdatePropertyDTO
- `PATCH /api/admin/properties/{id}` - Partial property update
  - Request Body: PatchPropertyDTO
- `DELETE /api/admin/properties/{id}` - Delete property (Admin only)
- `POST /api/admin/properties/{propertyId}/media` - Upload property media
  - Request: MultipartFile + mediaType
  - Response: MediaUploadDTO
- `DELETE /api/admin/media/{mediaId}` - Delete property media

#### Booking Management
- `GET /api/admin/bookings` - List all bookings with pagination and filtering
  - Query Parameters:
    - page (default: 0)
    - size (default: 20)
    - status (optional)
    - propertyId (optional)
    - userId (optional)
    - sortBy (default: "id")
    - sortDirection (default: "desc")
- `GET /api/admin/bookings/stats` - Get booking statistics
- `GET /api/admin/bookings/{id}` - Get booking details
- `PUT /api/admin/bookings/{id}` - Update booking status
  - Request Body: AdminBookingUpdateDTO
- `DELETE /api/admin/bookings/{id}` - Delete booking (Admin only)

### Admin DTOs

#### CreatePropertyDTO
```java
public class CreatePropertyDTO {
    private String name;
    private String description;
    private BigDecimal price;
    private String location;
    private List<PropertyCharacteristicDTO> characteristics;
    private List<FlatDTO> flats;
}
```

#### UpdatePropertyDTO
```java
public class UpdatePropertyDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String location;
    private List<PropertyCharacteristicDTO> characteristics;
    private List<FlatDTO> flats;
}
```

#### PatchPropertyDTO
```java
public class PatchPropertyDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String location;
    private List<PropertyCharacteristicDTO> characteristics;
    private List<FlatDTO> flats;
}
```

#### MediaUploadDTO
```java
public class MediaUploadDTO {
    private Long id;
    private String url;
    private String type;
    private Long propertyId;
    private LocalDateTime uploadedAt;
}
```

#### AdminBookingDetailDTO
```java
public class AdminBookingDetailDTO {
    private Long id;
    private Long propertyId;
    private String propertyName;
    private Long userId;
    private String userName;
    private String userContactNo;
    private LocalDateTime bookingDate;
    private LocalDateTime visitDate;
    private BookingStatus status;
    private String notes;
}
```

#### AdminBookingUpdateDTO
```java
public class AdminBookingUpdateDTO {
    private BookingStatus status;
    private String notes;
}
```

## Data Models

### Core Entities

#### User
```java
public class User {
    private Long id;
    private String name;
    private String contactNo;
    private String email;
    private String role;  // USER, ADMIN, EXECUTIVE
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### Property
```java
public class Property {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Address address;
    private List<PropertyCharacteristic> characteristics;
    private List<Media> media;
    private List<Flat> flats;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### Address
```java
public class Address {
    private Long id;
    private String location;
    private Property property;  // One-to-One relationship
}
```

### DTOs

#### PropertyCardDTO
```java
public class PropertyCardDTO {
    private Long id;
    private String title;
    private BigDecimal price;
    private String location;
    private String thumbnailUrl;
    private List<String> characteristics;
}
```

#### PropertyDetailDTO
```java
public class PropertyDetailDTO {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String location;
    private List<PropertyCharacteristicDTO> characteristics;
    private List<MediaDTO> media;
    private List<FlatDTO> flats;
}
```

## Error Handling

### Common Error Codes
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

### Custom Exceptions
- `InvalidOtpException`
- `ResourceNotFoundException`
- `UnauthorizedException`
- `BadRequestException`
- `FileStorageException`
- `SmsDeliveryException`

## Caching & Performance

### Cache Configuration
- Cache Provider: Caffeine
- Cache Names: propertyCache, propertySearchCache
- Cache Settings:
  - Maximum Size: 100 entries
  - Expiration: 60 minutes after write
  - Statistics: Enabled

### Performance Optimizations
1. Database Indexing
   - Index on property location
   - Index on user contact number
   - Index on booking dates

2. Caching Strategies
   - Property details caching
   - Search results caching
   - User profile caching

## Configuration

### Application Properties
```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/demo_01
spring.jpa.hibernate.ddl-auto=update

# JWT
app.jwt.secret=<secret_key>
app.jwt.expiration-ms=86400000

# OTP
app.otp.expiry-minutes=5
app.otp.length=6

# File Storage
app.file-storage.type=local
app.file-storage.upload-dir=uploads
app.media.base-url=/media

# Cache
spring.cache.type=caffeine
spring.cache.cache-names=propertyCache,propertySearchCache
```

## Security

### Security Features
1. JWT Authentication
2. OTP-based verification
3. Role-based access control
4. Rate limiting
5. CORS configuration

### Rate Limiting
- Enabled: true
- Limit: 30 requests
- Refresh Period: 60 seconds
- Header: X-API-Key

### CORS Configuration
- Allowed Origins:
  - http://localhost:3000
  - https://truvista-frontend.example.com

### Best Practices
1. All sensitive data is encrypted
2. Passwords are hashed
3. JWT tokens are short-lived
4. API endpoints are rate-limited
5. Input validation on all endpoints
6. Proper error handling and logging
7. Secure file upload handling 