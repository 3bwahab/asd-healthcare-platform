# System Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Style](#architecture-style)
3. [Technology Stack](#technology-stack)
4. [System Components](#system-components)
5. [Data Models & Relationships](#data-models--relationships)
6. [Key Workflows](#key-workflows)
7. [Security Architecture](#security-architecture)
8. [API Design](#api-design)
9. [Deployment Architecture](#deployment-architecture)

---

## Overview

The ASD Healthcare Management Platform is a RESTful API built to support autism spectrum disorder (ASD) healthcare services. The system facilitates appointment booking, AI-powered screening assessments, therapy session management, payment processing, and educational resource distribution.

### System Goals
- **Scalability**: Support growing user base and concurrent requests
- **Security**: Protect sensitive healthcare data with industry-standard encryption
- **Reliability**: 99.9% uptime with robust error handling
- **Performance**: Sub-200ms response times for critical operations
- **Maintainability**: Clean code architecture with comprehensive testing

---

## Architecture Style

### **MVC-Inspired Layered Architecture**

```
┌─────────────────────────────────────────────────────┐
│              Client Applications                     │
│   (Web, Mobile, Third-party Integrations)           │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS/REST
┌──────────────────▼──────────────────────────────────┐
│              API Gateway Layer                       │
│   (Express.js + Middleware Stack)                   │
│   - CORS, Helmet, Rate Limiting                     │
│   - Authentication (JWT)                             │
│   - Request Validation                               │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              Routes Layer                            │
│   (Endpoint Definitions & Route Handlers)           │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│            Services Layer                            │
│   (Business Logic & Data Processing)                │
│   - Authentication Services                          │
│   - Appointment Management                           │
│   - Order Processing                                 │
│   - AI Integration                                   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│            Data Access Layer                         │
│   (Mongoose Models & Database Schemas)              │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│            Persistence Layer                         │
│   (MongoDB Database)                                 │
└─────────────────────────────────────────────────────┘

         ┌──────────────────────────┐
         │  External Services       │
         │  - Stripe (Payments)     │
         │  - Cloudinary (Files)    │
         │  - Gmail (Email)         │
         │  - FastAPI (AI/ML)       │
         └──────────────────────────┘
```

---

## Technology Stack

### **Backend Core**
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.21
- **Language**: JavaScript (ES6+)
- **Database**: MongoDB 8.8 (via Mongoose ODM)

### **Security & Authentication**
- **JWT**: jsonwebtoken 9.0.2
- **Password Hashing**: bcryptjs 2.4.3
- **HTTP Security**: helmet 8.1.0
- **Rate Limiting**: express-rate-limit 8.2.1
- **Input Sanitization**: express-mongo-sanitize 2.2.0

### **External Integrations**
- **Payment Processing**: Stripe 18.2.1
- **File Storage**: Cloudinary 2.5.1
- **Email Service**: Nodemailer 6.9.16 (Gmail SMTP)
- **AI/ML Service**: FastAPI (Python microservice)

### **Development Tools**
- **Testing**: Jest 29.7 + Supertest 6.3
- **Code Quality**: ESLint + Prettier + Husky
- **API Documentation**: (Planned) Swagger/OpenAPI 3.0
- **Containerization**: Docker + docker-compose
- **CI/CD**: GitHub Actions

---

## System Components

### **1. Authentication & Authorization**
**Files**: `routes/authRoutes.js`, `services/authServices.js`, `models/parentModel.js`

**Responsibilities**:
- User registration (parents & doctors)
- Email verification with expiring codes
- JWT-based stateless authentication
- Password reset flows
- Role-based access control (parent, doctor, admin)

**Security Features**:
- Password hashing with bcrypt (12 rounds)
- Email verification required before login
- Reset codes expire after 10 minutes
- JWT tokens with 90-day expiration
- Protection middleware for routes

---

### **2. Appointment Management**
**Files**: `routes/appointmentRoutes.js`, `services/appointmentServices.js`, `models/appointmentModel.js`

**Responsibilities**:
- Doctors create available time slots
- Parents browse available appointments
- Booking with parent/child assignment
- Status management (available → booked → confirmed/cancelled)
- Conflict prevention with unique indexes

**Database Indexes**:
```javascript
{ doctorId: 1 }
{ parentId: 1 }
{ date: 1 }
{ status: 1 }
{ doctorId: 1, date: 1, time: 1 } // Unique compound index
```

---

### **3. Payment Processing**
**Files**: `routes/orderRoutes.js`, `services/orderServices.js`, `models/orderModel.js`

**Responsibilities**:
- Stripe checkout session creation (web)
- Payment intent creation (mobile)
- Webhook handling for payment confirmation
- Order record creation
- Payment history tracking

**Stripe Integration**:
- **Web Flow**: Hosted checkout pages
- **Mobile Flow**: Payment Intents API
- **Webhook Events**: `checkout.session.completed`, `payment_intent.succeeded`
- **Idempotency**: Duplicate order prevention

---

### **4. AI Screening Service**
**Files**: `routes/ai/aiRoutes.js`, `services/aiServices/aiServices.js`, `models/Ai/*`

**Responsibilities**:
- Fetch screening questions from FastAPI
- Submit answers for AI analysis
- Retrieve autism risk predictions
- Store assessment history
- Chat-based Q&A support

**FastAPI Integration**:
- HTTP communication via axios
- Question bank management
- Prediction storage in MongoDB
- Session-based chat history

---

### **5. Session Management**
**Files**: `routes/sessionRoutes.js`, `services/sessionServices.js`, `models/SessionModel.js`

**Responsibilities**:
- Therapy session creation by doctors
- Parent-doctor session tracking
- Session status management (coming, progress, done)
- Comment system for session notes
- Review system for session feedback

---

### **6. Review & Rating System**
**Files**: `routes/reviewRoutes.js`, `services/reviewServices.js`, `models/reviewModel.js`

**Responsibilities**:
- Parents review doctors post-appointment
- Rating aggregation (average calculation)
- Review moderation (parent can only review their doctors)
- Doctor rating display

**Rating Calculation**:
```javascript
// Automatic trigger on review creation/update
ratingAverage = sum(all ratings) / count(reviews)
ratingQuantity = count(reviews)
```

---

### **7. Healthcare Resources**
**Components**:
- **Education**: Articles about autism awareness
- **Pharmacy**: Medicine catalog with pricing
- **Medicine**: Medication database
- **Charity**: Support organizations directory

---

## Data Models & Relationships

### **Entity Relationship Diagram**
![ERD](diagrams/erd.png)

### **Core Relationships**

```
Parent (1) ──── (N) Child
Parent (1) ──── (N) Appointment
Parent (1) ──── (N) Order
Parent (1) ──── (N) Review
Parent (1) ──── (N) Session
Parent (1) ──── (1) Doctor  // One parent can register as doctor

Doctor (1) ──── (N) Appointment
Doctor (1) ──── (N) Session
Doctor (1) ──── (N) Order
Doctor (1) ──── (N) Review

Session (1) ──── (N) SessionReview

Pharmacy (1) ──── (N) Medicine
```

### **Key Model Characteristics**

**Parent Model**:
- Dual role support (can be parent AND doctor)
- Virtual field for children (populate support)
- Password hashing pre-save hook
- Reset code generation with expiration

**Doctor Model**:
- Inherits authentication from Parent model
- Rating aggregation fields (average, quantity)
- Session pricing configuration
- Specialization categorization

**Appointment Model**:
- Unique compound index prevents double-booking
- Status enum: available, booked, cancelled, confirmed
- Supports nested population (doctor → parent → children)

---

## Key Workflows

### **1. Authentication Flow**
![Auth Flow](diagrams/auth-flow-sequence.png)

**Steps**:
1. **Signup**: Parent registers → Email verification sent
2. **Verify**: Parent enters code → Account activated
3. **Login**: Credentials validated → JWT issued
4. **Access**: JWT in Authorization header → Route accessed

**Security**:
- Verification codes expire in 10 minutes
- Codes hashed with SHA256 before storage
- Passwords hashed with bcrypt (12 rounds)
- JWT signed with secret key

---

### **2. Appointment Booking Flow**
![Appointment Flow](diagrams/appointment-booking-sequence.png)

**Steps**:
1. **Create Slots**: Doctor creates available time slots
2. **Browse**: Parent views available appointments
3. **Book**: Parent books specific slot with child assignment
4. **Confirm**: Doctor confirms appointment
5. **Attend/Cancel**: Appointment completed or cancelled

**Concurrency Control**:
- Unique index on (doctorId, date, time)
- Status checks before state transitions
- Database-level constraint enforcement

---

### **3. Payment Processing Flow**
![Payment Flow](diagrams/payment-flow-sequence.png)

**Web Flow**:
1. Parent clicks "Book & Pay"
2. Backend creates Stripe checkout session
3. Parent redirected to Stripe-hosted page
4. Payment completed
5. Webhook receives `checkout.session.completed`
6. Order created in database

**Mobile Flow**:
1. Parent initiates payment
2. Backend creates Payment Intent
3. Client confirms payment with Stripe SDK
4. Webhook receives `payment_intent.succeeded`
5. Order created in database

**Idempotency**:
- Webhook checks for existing orders before creation
- Prevents duplicate orders from retried webhooks

---

## Security Architecture

### **Authentication**
- **Method**: JWT (JSON Web Tokens)
- **Expiration**: 90 days
- **Storage**: Client-side (localStorage/cookies)
- **Transmission**: Authorization: Bearer <token>

### **Authorization**
- **Middleware**: `protectForParent`, `protectForDoctor`, `allowedTo(roles)`
- **Role-Based**: Parent, Doctor, Admin
- **Resource-Based**: Ownership validation (user can only modify their data)

### **Data Protection**
- **Encryption**: HTTPS/TLS in production
- **Hashing**: bcrypt for passwords, SHA256 for reset codes
- **Sanitization**: Mongo injection protection via express-mongo-sanitize
- **Validation**: express-validator on all inputs
- **Headers**: Helmet.js for security headers

### **Rate Limiting**
```javascript
// 100 requests per 15 minutes per IP
windowMs: 15 * 60 * 1000
max: 100
```

### **CORS Policy**
```javascript
// Configurable allowed origins via environment variable
allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')
credentials: true // Allow cookies
```

---

## API Design

### **RESTful Principles**
- **Resources**: Nouns in URLs (`/api/v1/appointments`)
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: 200, 201, 400, 401, 403, 404, 500
- **Versioning**: `/api/v1/` prefix

### **Endpoint Structure**
```
/api/v1/{resource}/{action?}/{id?}

Examples:
GET    /api/v1/appointments              # List all
GET    /api/v1/appointments/:id          # Get one
POST   /api/v1/appointments              # Create
PUT    /api/v1/appointments/:id          # Update
DELETE /api/v1/appointments/:id          # Delete
GET    /api/v1/appointments/available    # Custom action
```

### **Request/Response Format**
**Request**:
```json
{
  "userName": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "userId": "65a7b3cf48f2a123456789a",
    "email": "john@example.com"
  }
}
```

**Error Response**:
```json
{
  "status": "fail",
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### **Query Parameters**
- **Pagination**: `?page=1&limit=10`
- **Sorting**: `?sort=createdAt,-price`
- **Filtering**: `?status=available&date=2025-01-15`
- **Field Selection**: `?fields=name,email,phone`
- **Search**: `?keyword=autism`

---

## Deployment Architecture

### **Development Environment**
```
┌─────────────────┐
│   Developer     │
│   Machine       │
│                 │
│  Node.js 18     │
│  MongoDB Local  │
│  .env config    │
└─────────────────┘
```

### **Production Environment (Docker)**
```
┌────────────────────────────────────────┐
│          Docker Host                    │
│  ┌──────────────────────────────────┐  │
│  │   Node.js App Container          │  │
│  │   - Express Server               │  │
│  │   - Port 5000                    │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │   MongoDB Container              │  │
│  │   - Port 27017                   │  │
│  │   - Persistent Volume            │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │   FastAPI Container              │  │
│  │   - Python 3.11                  │  │
│  │   - Port 8000                    │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
         │                    │
         ▼                    ▼
    Cloudinary            Stripe API
    (File Storage)        (Payments)
```

### **CI/CD Pipeline**
```
GitHub Push → Actions Triggered → Lint & Format → Run Tests → Build Docker → Deploy
```

**GitHub Actions Jobs**:
1. **Lint**: ESLint + Prettier checks
2. **Test**: Jest test suite with coverage
3. **Build**: Docker image creation
4. **Deploy**: (Future) Auto-deploy to production

---

## Performance Optimizations

### **Database Indexes**
- 35+ indexes across 6 models
- Compound indexes for common query patterns
- Unique indexes for constraint enforcement

### **Query Optimization**
- Selective field population
- Pagination for large datasets
- Lean queries where virtuals not needed

### **Caching Strategy**
- (Future) Redis for session storage
- (Future) Response caching for read-heavy endpoints

### **Asset Optimization**
- Cloudinary for image compression
- Sharp for server-side image processing

---

## Monitoring & Logging

### **Current**
- Console logging for development
- Error stack traces in development mode
- Request logging with Morgan

### **Planned**
- **Audit Logging**: Track all critical operations
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: New Relic/DataDog
- **Uptime Monitoring**: UptimeRobot/Pingdom

---

## Future Enhancements

1. **Microservices**: Extract AI service into separate microservice
2. **GraphQL**: Alternative API interface
3. **WebSockets**: Real-time notifications
4. **Redis**: Caching layer for performance
5. **Elasticsearch**: Advanced search capabilities
6. **CDN**: Static asset delivery
7. **Load Balancer**: Horizontal scaling support

---

## References

- [System ERD](diagrams/erd.png)
- [Use Case Diagram](diagrams/use-case.png)
- [Class Diagram](diagrams/class-diagram.png)
- [Auth Sequence](diagrams/auth-flow-sequence.png)
- [Appointment Sequence](diagrams/appointment-booking-sequence.png)
- [Payment Sequence](diagrams/payment-flow-sequence.png)
- [API Examples](API_EXAMPLES.md)
- [Developer Guide](DEVELOPER_GUIDE.md)
- [Contributing](../CONTRIBUTING.md)
