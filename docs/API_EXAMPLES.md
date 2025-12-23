# API Examples and Usage Guide

This document provides comprehensive examples for interacting with the ASD Healthcare Management Platform API.

## Table of Contents

- [Authentication](#authentication)
  - [Parent Signup](#parent-signup)
  - [Email Verification](#email-verification)
  - [Login](#login)
  - [Password Reset](#password-reset)
- [User Management](#user-management)
  - [Get Profile](#get-profile)
  - [Update Profile](#update-profile)
  - [Change Password](#change-password)
- [Child Management](#child-management)
  - [Add Child](#add-child)
  - [Get Children](#get-children)
  - [Update Child](#update-child)
- [Healthcare Services](#healthcare-services)
  - [Book Appointment](#book-appointment)
  - [Get Appointments](#get-appointments)
  - [Create Session](#create-session)
  - [Submit Review](#submit-review)
- [AI Screening](#ai-screening)
  - [Get Question](#get-question)
  - [Submit Answer](#submit-answer)
  - [Get Prediction](#get-prediction)
- [Payments](#payments)
  - [Create Checkout Session](#create-checkout-session)
  - [Handle Webhook](#handle-webhook)
- [Error Handling](#error-handling)

---

## Authentication

### Parent Signup

**Endpoint:** `POST /api/v1/auth/signup`

**Description:** Register a new parent user account.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "passwordConfirmation": "SecurePass123!",
    "age": 35,
    "phone": "+201234567890",
    "address": "123 Main St, Cairo, Egypt"
  }'
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE3YjNjZjQ4ZjJhMTIzNDU2Nzg5MGEiLCJpYXQiOjE3MDU1NTU1NTUsImV4cCI6MTcxMzMzMTU1NX0.xyz123",
  "data": {
    "user": {
      "_id": "65a7b3cf48f2a123456789a",
      "userName": "John Doe",
      "email": "john.doe@example.com",
      "role": "parent",
      "age": 35,
      "phone": "+201234567890",
      "address": "123 Main St, Cairo, Egypt",
      "emailVerified": false,
      "createdAt": "2025-01-18T10:30:00.000Z"
    }
  }
}
```

**Validation Rules:**
- `userName`: Required, min 3 characters
- `email`: Required, valid email format
- `password`: Required, min 6 characters
- `passwordConfirmation`: Must match password
- `age`: Required, number
- `phone`: Required
- `address`: Required

---

### Email Verification

**Endpoint:** `POST /api/v1/auth/verifyEmail`

**Description:** Verify email address using code sent to user's email.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/verifyEmail \
  -H "Content-Type: application/json" \
  -d '{
    "verificationCode": "123456"
  }'
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Email verified successfully"
}
```

---

### Login

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Authenticate user and receive JWT token.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "65a7b3cf48f2a123456789a",
      "userName": "John Doe",
      "email": "john.doe@example.com",
      "role": "parent",
      "emailVerified": true
    }
  }
}
```

**Usage Note:** Include the token in subsequent requests:
```bash
curl -X GET http://localhost:8000/api/v1/parent/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Password Reset

**Step 1: Request Reset Code**

**Endpoint:** `POST /api/v1/auth/forgotPassword`

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/forgotPassword \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Reset code sent to your email"
}
```

**Step 2: Verify Reset Code**

**Endpoint:** `POST /api/v1/auth/verifyResetCode`

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/verifyResetCode \
  -H "Content-Type: application/json" \
  -d '{
    "resetCode": "123456"
  }'
```

**Response (200 OK):**
```json
{
  "status": "success"
}
```

**Step 3: Reset Password**

**Endpoint:** `PUT /api/v1/auth/resetPassword`

**Request:**
```bash
curl -X PUT http://localhost:8000/api/v1/auth/resetPassword \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "newPassword": "NewSecurePass456!"
  }'
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## User Management

### Get Profile

**Endpoint:** `GET /api/v1/parent/profile`

**Description:** Get authenticated parent's profile.

**Request:**
```bash
curl -X GET http://localhost:8000/api/v1/parent/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "65a7b3cf48f2a123456789a",
    "userName": "John Doe",
    "email": "john.doe@example.com",
    "role": "parent",
    "age": 35,
    "phone": "+201234567890",
    "address": "123 Main St, Cairo, Egypt",
    "emailVerified": true,
    "profileImage": "https://res.cloudinary.com/xyz/image/upload/v123/profile.jpg",
    "createdAt": "2025-01-18T10:30:00.000Z",
    "updatedAt": "2025-01-18T10:30:00.000Z"
  }
}
```

---

### Update Profile

**Endpoint:** `PUT /api/v1/parent/updateProfile`

**Description:** Update authenticated parent's profile information.

**Request:**
```bash
curl -X PUT http://localhost:8000/api/v1/parent/updateProfile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "John Michael Doe",
    "phone": "+201987654321",
    "address": "456 Oak Avenue, Cairo, Egypt"
  }'
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "65a7b3cf48f2a123456789a",
    "userName": "John Michael Doe",
    "email": "john.doe@example.com",
    "phone": "+201987654321",
    "address": "456 Oak Avenue, Cairo, Egypt",
    "updatedAt": "2025-01-18T14:20:00.000Z"
  }
}
```

---

### Change Password

**Endpoint:** `PUT /api/v1/parent/changePassword`

**Description:** Change authenticated user's password.

**Request:**
```bash
curl -X PUT http://localhost:8000/api/v1/parent/changePassword \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123!",
    "password": "NewSecurePass456!",
    "passwordConfirmation": "NewSecurePass456!"
  }'
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "65a7b3cf48f2a123456789a",
      "userName": "John Michael Doe",
      "email": "john.doe@example.com"
    }
  }
}
```

---

## Child Management

### Add Child

**Endpoint:** `POST /api/v1/child`

**Description:** Add a child to parent's account.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/child \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "childName": "Emma Doe",
    "childAge": 6,
    "childGender": "female",
    "diagnosis": "ASD Level 1",
    "medicalHistory": "Diagnosed at age 4, receives speech therapy"
  }'
```

**Response (201 Created):**
```json
{
  "data": {
    "_id": "65a8c4d159g3b234567890b",
    "childName": "Emma Doe",
    "childAge": 6,
    "childGender": "female",
    "diagnosis": "ASD Level 1",
    "medicalHistory": "Diagnosed at age 4, receives speech therapy",
    "parentId": "65a7b3cf48f2a123456789a",
    "createdAt": "2025-01-18T15:00:00.000Z"
  }
}
```

---

### Get Children

**Endpoint:** `GET /api/v1/child`

**Description:** Get all children for authenticated parent.

**Request:**
```bash
curl -X GET http://localhost:8000/api/v1/child \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "results": 2,
  "data": [
    {
      "_id": "65a8c4d159g3b234567890b",
      "childName": "Emma Doe",
      "childAge": 6,
      "childGender": "female",
      "diagnosis": "ASD Level 1",
      "parentId": "65a7b3cf48f2a123456789a"
    },
    {
      "_id": "65a8c5e260h4c345678901c",
      "childName": "Liam Doe",
      "childAge": 4,
      "childGender": "male",
      "diagnosis": "ASD Level 2",
      "parentId": "65a7b3cf48f2a123456789a"
    }
  ]
}
```

---

### Update Child

**Endpoint:** `PUT /api/v1/child/:id`

**Description:** Update child information.

**Request:**
```bash
curl -X PUT http://localhost:8000/api/v1/child/65a8c4d159g3b234567890b \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "childAge": 7,
    "medicalHistory": "Diagnosed at age 4, receives speech and occupational therapy"
  }'
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "65a8c4d159g3b234567890b",
    "childName": "Emma Doe",
    "childAge": 7,
    "childGender": "female",
    "diagnosis": "ASD Level 1",
    "medicalHistory": "Diagnosed at age 4, receives speech and occupational therapy",
    "updatedAt": "2025-01-18T16:30:00.000Z"
  }
}
```

---

## Healthcare Services

### Book Appointment

**Endpoint:** `POST /api/v1/appointment`

**Description:** Book an appointment with a doctor.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/appointment \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "65a9d6f371i5d456789012d",
    "childId": "65a8c4d159g3b234567890b",
    "appointmentDate": "2025-01-25T10:00:00.000Z",
    "reason": "Initial consultation for behavioral therapy"
  }'
```

**Response (201 Created):**
```json
{
  "data": {
    "_id": "65aae70482j6e567890123e",
    "parentId": "65a7b3cf48f2a123456789a",
    "doctorId": {
      "_id": "65a9d6f371i5d456789012d",
      "doctorName": "Dr. Sarah Johnson",
      "specialization": "Behavioral Therapy"
    },
    "childId": {
      "_id": "65a8c4d159g3b234567890b",
      "childName": "Emma Doe"
    },
    "appointmentDate": "2025-01-25T10:00:00.000Z",
    "reason": "Initial consultation for behavioral therapy",
    "status": "pending",
    "createdAt": "2025-01-18T17:00:00.000Z"
  }
}
```

---

### Get Appointments

**Endpoint:** `GET /api/v1/appointment`

**Description:** Get all appointments for authenticated parent.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/appointment?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "results": 1,
  "data": [
    {
      "_id": "65aae70482j6e567890123e",
      "doctorId": {
        "doctorName": "Dr. Sarah Johnson",
        "specialization": "Behavioral Therapy",
        "email": "dr.sarah@example.com"
      },
      "childId": {
        "childName": "Emma Doe",
        "childAge": 7
      },
      "appointmentDate": "2025-01-25T10:00:00.000Z",
      "status": "pending",
      "reason": "Initial consultation for behavioral therapy"
    }
  ]
}
```

---

### Create Session

**Endpoint:** `POST /api/v1/session`

**Description:** Create a therapy session (Doctor only).

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/session \
  -H "Authorization: Bearer DOCTOR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "65aae70482j6e567890123e",
    "sessionDate": "2025-01-25T10:00:00.000Z",
    "duration": 60,
    "notes": "First session went well. Child showed good engagement.",
    "recommendations": "Continue weekly sessions, focus on social interaction"
  }'
```

**Response (201 Created):**
```json
{
  "data": {
    "_id": "65abf81593k7f678901234f",
    "appointmentId": "65aae70482j6e567890123e",
    "doctorId": "65a9d6f371i5d456789012d",
    "childId": "65a8c4d159g3b234567890b",
    "sessionDate": "2025-01-25T10:00:00.000Z",
    "duration": 60,
    "notes": "First session went well. Child showed good engagement.",
    "recommendations": "Continue weekly sessions, focus on social interaction",
    "createdAt": "2025-01-25T11:15:00.000Z"
  }
}
```

---

### Submit Review

**Endpoint:** `POST /api/v1/review`

**Description:** Submit a review for a doctor after session.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/review \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "65a9d6f371i5d456789012d",
    "rating": 5,
    "comment": "Dr. Sarah is excellent with children. Highly recommend!"
  }'
```

**Response (201 Created):**
```json
{
  "data": {
    "_id": "65ac0926a4l8g789012345g",
    "parentId": "65a7b3cf48f2a123456789a",
    "doctorId": "65a9d6f371i5d456789012d",
    "rating": 5,
    "comment": "Dr. Sarah is excellent with children. Highly recommend!",
    "createdAt": "2025-01-25T12:00:00.000Z"
  }
}
```

---

## AI Screening

### Get Question

**Endpoint:** `GET /api/v1/ai/getQuestion/:index`

**Description:** Get autism screening question by index.

**Request:**
```bash
curl -X GET http://localhost:8000/api/v1/ai/getQuestion/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "question": "Does your child make eye contact during conversations?",
  "index": 1,
  "category": "social_interaction"
}
```

---

### Submit Answer

**Endpoint:** `POST /api/v1/ai/submitAnswer`

**Description:** Submit answer to screening question.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/submitAnswer \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "65ad1a37b5m9h890123456h",
    "childId": "65a8c4d159g3b234567890b",
    "answer": "Sometimes, but not consistently",
    "questionIndex": 1
  }'
```

**Response (201 Created):**
```json
{
  "data": {
    "_id": "65ad2b48c6n0i901234567i",
    "questionId": "65ad1a37b5m9h890123456h",
    "childId": "65a8c4d159g3b234567890b",
    "answer": "Sometimes, but not consistently",
    "processedValue": 2,
    "createdAt": "2025-01-26T10:00:00.000Z"
  }
}
```

---

### Get Prediction

**Endpoint:** `POST /api/v1/ai/getPrediction`

**Description:** Get autism screening prediction after all questions answered.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/ai/getPrediction \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "65a8c4d159g3b234567890b"
  }'
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "65ad3c59d7o1j012345678j",
    "childId": "65a8c4d159g3b234567890b",
    "prediction": "Moderate risk - Further evaluation recommended",
    "confidence": 0.78,
    "riskLevel": "moderate",
    "recommendations": [
      "Schedule consultation with developmental pediatrician",
      "Consider comprehensive ASD assessment",
      "Monitor social interaction patterns"
    ],
    "createdAt": "2025-01-26T11:00:00.000Z"
  }
}
```

---

## Payments

### Create Checkout Session

**Endpoint:** `POST /api/v1/order/checkout-session/:appointmentId`

**Description:** Create Stripe checkout session for appointment payment.

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/order/checkout-session/65aae70482j6e567890123e \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "session": {
    "id": "cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  }
}
```

**Usage:** Redirect user to the `session.url` to complete payment.

---

### Handle Webhook

**Endpoint:** `POST /api/v1/order/webhook`

**Description:** Stripe webhook handler for payment events (Internal use).

**Note:** This endpoint is called by Stripe automatically when payment events occur. Configure this URL in your Stripe dashboard webhook settings:

```
https://your-domain.com/api/v1/order/webhook
```

**Events Handled:**
- `checkout.session.completed` - Payment successful, creates order
- `payment_intent.succeeded` - Payment confirmed
- `payment_intent.payment_failed` - Payment failed

---

## Error Handling

### Common Error Responses

**400 Bad Request - Validation Error:**
```json
{
  "status": "error",
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized - Missing/Invalid Token:**
```json
{
  "status": "fail",
  "message": "You are not logged in. Please login to access this route"
}
```

**403 Forbidden - Insufficient Permissions:**
```json
{
  "status": "fail",
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found - Resource Not Found:**
```json
{
  "status": "fail",
  "message": "No document found for this id"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Something went wrong on the server"
}
```

---

## Query Parameters

### Pagination

```bash
# Get page 2 with 20 items per page
curl -X GET "http://localhost:8000/api/v1/doctor?page=2&limit=20"
```

### Filtering

```bash
# Filter doctors by specialization
curl -X GET "http://localhost:8000/api/v1/doctor?specialization=Behavioral Therapy"

# Filter appointments by status
curl -X GET "http://localhost:8000/api/v1/appointment?status=confirmed"
```

### Sorting

```bash
# Sort by rating descending
curl -X GET "http://localhost:8000/api/v1/doctor?sort=-rating"

# Sort by date ascending
curl -X GET "http://localhost:8000/api/v1/appointment?sort=appointmentDate"
```

### Field Selection

```bash
# Select specific fields only
curl -X GET "http://localhost:8000/api/v1/parent?fields=userName,email,phone"
```

### Search

```bash
# Search doctors by name
curl -X GET "http://localhost:8000/api/v1/doctor?keyword=Sarah"
```

### Combined Example

```bash
# Get confirmed appointments, sorted by date, page 1, 10 per page
curl -X GET "http://localhost:8000/api/v1/appointment?status=confirmed&sort=appointmentDate&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing Tips

### Using Environment Variables

Create a `.env.test` file:
```bash
API_URL=http://localhost:8000
PARENT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DOCTOR_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Use in scripts:
```bash
curl -X GET "$API_URL/api/v1/parent/profile" \
  -H "Authorization: Bearer $PARENT_TOKEN"
```

### Using Postman

1. Import the Postman collection (when available)
2. Set environment variables for `baseUrl` and `token`
3. Use `{{baseUrl}}` and `{{token}}` in requests

### Testing with HTTPie

```bash
# Login
http POST localhost:8000/api/v1/auth/login \
  email=john.doe@example.com \
  password=SecurePass123!

# Get profile (using token from login response)
http GET localhost:8000/api/v1/parent/profile \
  Authorization:"Bearer YOUR_TOKEN_HERE"
```

---

## Rate Limiting

**Future Enhancement:** Rate limiting will be implemented for authentication endpoints:
- 5 login attempts per 15 minutes
- 3 password reset requests per hour
- 10 API requests per minute for general endpoints

---

## API Versioning

Current version: **v1**

All endpoints are prefixed with `/api/v1/`. Future API changes will use `/api/v2/` to maintain backward compatibility.

---

## Additional Resources

- [Main README](../README.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [FastAPI Integration Guide](./FASTAPI_INTEGRATION.md)
- [Deployment Guide](./DEPLOYMENT.md)
