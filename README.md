# ASD Healthcare Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> A comprehensive RESTful API for Autism Spectrum Disorder (ASD) healthcare management, connecting families with healthcare professionals, educational resources, and support services.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [📊 Architecture & Database Design](#-architecture--database-design)
- [💻 Code Examples](#-code-examples)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 Architecture](#-architecture)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running Locally](#running-locally)
  - [Running with Docker](#running-with-docker)
- [📚 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [👨‍💻 Developer Guide](#-developer-guide)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

## 🎯 Overview

The ASD Healthcare Management Platform is a production-ready RESTful API designed to bridge the gap between families of children with autism spectrum disorder and healthcare professionals. It provides a comprehensive suite of tools for appointment management, therapy sessions, AI-powered screening, educational resources, and community support.

**Key Objectives:**
- Simplify healthcare access for ASD families
- Enable remote consultations and therapy sessions
- Provide AI-assisted autism screening
- Connect families with educational resources and support networks

## ✨ Features

### User Management
- 👤 **Parent Registration**: Secure account creation with email verification
- 👨‍⚕️ **Doctor Profiles**: Healthcare professional registration with credentials
- 🔐 **JWT Authentication**: Secure token-based authentication
- 🔑 **Password Reset**: Email-based password recovery with secure codes

### Healthcare Services
- 📅 **Appointment Booking**: Schedule consultations with doctors
- 🧑‍🤝‍🧑 **Therapy Sessions**: Manage ongoing therapy sessions
- ⭐ **Reviews & Ratings**: Rate and review healthcare professionals
- 📊 **Progress Tracking**: Monitor child development over time

### AI/ML Integration
- 🤖 **Autism Screening**: AI-powered questionnaire for early detection
- 📈 **Severity Assessment**: ML-based severity level prediction
- 💬 **Chatbot Support**: Conversational AI for guidance
- 🎤 **Audio Transcription**: Convert audio responses to text

### Resources & Support
- 📚 **Educational Articles**: Curated content for ASD support
- 💊 **Medicine Catalog**: Browse and search medications
- 🏥 **Pharmacy Directory**: Find local pharmacies
- 🤝 **Charity Organizations**: Connect with support organizations

### Payment & Commerce
- 💳 **Stripe Integration**: Secure payment processing
- 🧾 **Order Management**: Track service orders
- 🔔 **Webhook Handling**: Real-time payment notifications

### Infrastructure
- 📧 **Email Notifications**: Automated appointment reminders
- ☁️ **File Uploads**: Cloudinary integration for documents/images
- 🔍 **Advanced Search**: Keyword search across resources
- 📄 **Pagination**: Efficient data retrieval with pagination

## 📊 Architecture & Database Design

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    Parent ||--o{ Child : has
    Parent ||--o{ Order : places
    Parent ||--o{ Appointment : books
    Doctor ||--o{ Appointment : provides
    Doctor ||--o{ Session : conducts
    Parent ||--o{ Session : attends
    Session ||--o{ SessionReview : has
    Doctor ||--o{ Review : receives
    Pharmacy ||--o{ Medicine : sells
```

**[View Full ERD](docs/diagrams/erd.mmd)** | **[View Use Case Diagram](docs/diagrams/use-case.mmd)** | **[View Class Diagram](docs/diagrams/class-diagram.mmd)**

### System Architecture

The platform follows a **layered MVC architecture**:
- **Routes Layer**: Endpoint definitions and HTTP handling
- **Services Layer**: Business logic and data processing
- **Models Layer**: Database schemas and validation
- **External Services**: Stripe, Cloudinary, FastAPI, Email

For detailed architecture documentation, see **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

### Sequence Diagrams

Key workflows documented with sequence diagrams:
- **[Authentication Flow](docs/diagrams/auth-flow-sequence.mmd)**: Signup → Email Verification → Login → Password Reset
- **[Appointment Booking](docs/diagrams/appointment-booking-sequence.mmd)**: Create Slots → Browse → Book → Confirm
- **[Payment Processing](docs/diagrams/payment-flow-sequence.mmd)**: Web/Mobile Checkout → Webhooks → Order Creation

## 💻 Code Examples

### Authentication Flow

**Parent Signup**

```javascript
// Request
const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userName: "John Doe",
    email: "john@example.com",
    password: "SecureP@ss123",
    passwordConfirmation: "SecureP@ss123",
    phone: "+201234567890",
    age: 35,
    address: "123 Main St, Cairo, Egypt"
  })
});

const data = await response.json();

// Expected Response (201 Created)
{
  "status": "success",
  "message": "Check your email to verify account",
  "data": {
    "userId": "65a7b3cf48f2a123456789a",
    "email": "john@example.com",
    "verificationCodeSent": true
  }
}
```

**Email Verification**

```javascript
// Request
const response = await fetch('http://localhost:8000/api/v1/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: "john@example.com",
    code: "A7B3D9"
  })
});

// Expected Response (200 OK)
{
  "status": "success",
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "65a7b3cf48f2a123456789a",
      "userName": "John Doe",
      "email": "john@example.com",
      "role": "parent",
      "verified": true
    }
  }
}
```

### Appointment Booking

**Step 1: Browse Available Appointments**

```javascript
// Request
const response = await fetch('http://localhost:8000/api/v1/appointment/available/DOCTOR_ID', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
});

// Expected Response (200 OK)
{
  "status": "success",
  "results": 5,
  "data": [
    {
      "_id": "65b8c4df59f3b234567890b",
      "doctorId": {
        "_id": "65a9d5ef60f4c345678901c",
        "parent": {
          "userName": "Dr. Sarah Ahmed"
        },
        "specialization": "Behavioral Therapy",
        "sessionPrice": 500
      },
      "date": "2025-01-15",
      "time": "10:00 AM",
      "status": "available",
      "duration": 60
    }
  ]
}
```

**Step 2: Book Specific Appointment**

```javascript
// Request
const response = await fetch('http://localhost:8000/api/v1/appointment/book/SLOT_ID', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    parentId: "65a7b3cf48f2a123456789a",
    childId: "65c9e6fg71g5d456789012d"
  })
});

// Expected Response (200 OK)
{
  "status": "success",
  "message": "Appointment booked successfully",
  "data": {
    "_id": "65b8c4df59f3b234567890b",
    "doctorId": "65a9d5ef60f4c345678901c",
    "parentId": "65a7b3cf48f2a123456789a",
    "childId": "65c9e6fg71g5d456789012d",
    "date": "2025-01-15",
    "time": "10:00 AM",
    "status": "booked"
  }
}
```

### AI Screening Integration

**Get Screening Questions**

```javascript
// Request
const response = await fetch('http://localhost:8000/api/v1/ai/questions', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

// Expected Response (200 OK)
{
  "status": "success",
  "data": {
    "questions": [
      {
        "id": "Q1",
        "text": "Does your child make eye contact when you talk to them?",
        "type": "yes_no"
      },
      {
        "id": "Q2",
        "text": "Does your child respond to their name when called?",
        "type": "yes_no"
      }
    ],
    "totalQuestions": 20
  }
}
```

**Submit Answers for Prediction**

```javascript
// Request
const response = await fetch('http://localhost:8000/api/v1/ai/predict', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    childId: "65c9e6fg71g5d456789012d",
    answers: [
      { questionId: "Q1", answer: "yes" },
      { questionId: "Q2", answer: "no" },
      { questionId: "Q3", answer: "sometimes" }
    ]
  })
});

// Expected Response (200 OK)
{
  "status": "success",
  "data": {
    "prediction": {
      "riskLevel": "moderate",
      "confidence": 0.78,
      "severity": "mild-to-moderate",
      "recommendations": [
        "Schedule professional evaluation",
        "Monitor social interaction patterns",
        "Consider early intervention programs"
      ]
    },
    "childId": "65c9e6fg71g5d456789012d",
    "assessmentDate": "2025-01-10T14:30:00.000Z"
  }
}
```

### Payment Processing

**Create Stripe Checkout Session (Web)**

```javascript
// Request
const response = await fetch('http://localhost:8000/api/v1/orders/checkout-session', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    doctorId: "65a9d5ef60f4c345678901c",
    sessionPrice: 500,
    appointmentDetails: {
      date: "2025-01-15",
      time: "10:00 AM"
    }
  })
});

// Expected Response (200 OK)
{
  "status": "success",
  "data": {
    "sessionId": "cs_test_a1b2c3d4e5f6...",
    "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4e5f6#fidkdWxOYHN..."
  }
}

// User is redirected to Stripe-hosted checkout page
```

**View Payment History**

```javascript
// Request
const response = await fetch('http://localhost:8000/api/v1/orders', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

// Expected Response (200 OK)
{
  "status": "success",
  "results": 3,
  "data": [
    {
      "_id": "65d0f7gh82h6e567890123e",
      "parent": "65a7b3cf48f2a123456789a",
      "doctor": "65a9d5ef60f4c345678901c",
      "price": 500,
      "paymentMethodType": "card",
      "isPaid": true,
      "paidAt": "2025-01-10T15:45:00.000Z",
      "info": {
        "date": "2025-01-15",
        "time": "10:00 AM"
      }
    }
  ]
}
```

### Error Handling

**Validation Error Example**

```javascript
// Request with invalid data
const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: "invalid-email",
    password: "123"
  })
});

// Expected Response (400 Bad Request)
{
  "status": "fail",
  "message": "Validation errors",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    },
    {
      "field": "userName",
      "message": "User name is required"
    }
  ]
}
```

**Authentication Error Example**

```javascript
// Request without valid token
const response = await fetch('http://localhost:8000/api/v1/appointment/available/DOCTOR_ID', {
  headers: {
    'Authorization': 'Bearer invalid_token'
  }
});

// Expected Response (401 Unauthorized)
{
  "status": "fail",
  "message": "Invalid token. Please login again"
}
```

For more API examples, see **[API_EXAMPLES.md](docs/API_EXAMPLES.md)**.

## 🛠 Tech Stack

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (>= 18.0.0)
- **Framework**: [Express.js](https://expressjs.com/) (4.21.1)
- **Language**: JavaScript (ES6+)

### Database
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) ODM (8.8.3)
- **Hosting**: MongoDB Atlas (cloud)

### Authentication & Security
- **Authentication**: JSON Web Tokens ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken))
- **Password Hashing**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Validation**: [express-validator](https://express-validator.github.io/docs/)

### External Services
- **Payments**: [Stripe](https://stripe.com/) (18.2.1)
- **File Storage**: [Cloudinary](https://cloudinary.com/) (2.5.1)
- **Email**: [Nodemailer](https://nodemailer.com/) via Gmail SMTP
- **AI/ML**: [FastAPI](https://fastapi.tiangolo.com/) (Python backend)

### DevOps & Tooling
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint (Airbnb style), Prettier
- **Git Hooks**: Husky + lint-staged
- **Process Manager**: Nodemon (development)

## 🏗 Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         Express.js API Server           │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ Routes  │→ │ Services │→ │ Models │ │
│  └─────────┘  └──────────┘  └────────┘ │
└────────┬────────────┬───────────┬───────┘
         │            │           │
    ┌────▼────┐  ┌────▼────┐ ┌───▼──────┐
    │ MongoDB │  │ Stripe  │ │Cloudinary│
    └─────────┘  └─────────┘ └──────────┘
         │
    ┌────▼────────┐
    │   FastAPI   │
    │  (AI/ML)    │
    └─────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/cloud/atlas/register))
- **Stripe** account in test mode ([Sign up](https://dashboard.stripe.com/register))
- **Cloudinary** account ([Sign up](https://cloudinary.com/users/register/free))
- **Gmail** account with App Password ([Setup guide](https://support.google.com/accounts/answer/185833))
- **Docker** (optional, for containerized development)

### Installation

```bash
# Clone the repository
git clone https://github.com/3bwahab/asd-healthcare-platform.git
cd asd-healthcare-platform

# Install dependencies
npm install

# Install Husky hooks
npm run prepare
```

### Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example config.env
   ```

2. **Fill in your credentials** in `config.env`:
   ```env
   # Server
   PORT=8000
   MODE_ENV=development

   # Database
   DB_URL=mongodb+srv://username:password@cluster.mongodb.net/asd_database

   # JWT
   JWT_SECRET_KEY=<generate-with-crypto>
   JWT_EXPIRE_TIME=90d

   # Email
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password

   # Cloudinary
   CLOUD_NAME=your-cloud-name
   API_KEY=your-api-key
   API_SECRET=your-api-secret

   # Stripe
   STRIPE_SECRET=sk_test_...
   STRIPE_PUBLIC=pk_test_...
   WEBHOOK_SECRET=whsec_...

   # FastAPI
   FASTAPI_URL=http://localhost:8080
   ```

3. **Generate a secure JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### Running Locally

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:8000`

### Running with Docker

```bash
# Start all services (MongoDB + API)
docker-compose up

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Docker Compose will:
- Start MongoDB on port 27017
- Start the API on port 8000
- Set up networking between services
- Enable hot-reload for development

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication
- `POST /auth/signup` - Register new parent
- `POST /auth/doctor-signup` - Register new doctor
- `POST /auth/login` - Login user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/verify-reset-code` - Verify reset code
- `PUT /auth/reset-password` - Reset password

#### Users
- `GET /parents` - Get all parents (admin only)
- `GET /parents/:id` - Get parent by ID
- `PUT /parents/:id` - Update parent profile
- `DELETE /parents/:id` - Delete parent

- `GET /doctors` - Get all doctors
- `GET /doctors/:id` - Get doctor by ID
- `PUT /doctors/:id` - Update doctor profile

#### Healthcare
- `POST /appointment` - Book appointment
- `GET /appointment` - Get user appointments
- `PUT /appointment/:id` - Update appointment status

- `POST /sessions` - Create therapy session
- `GET /sessions` - Get all sessions
- `GET /sessions/:id` - Get session by ID

- `POST /reviews` - Submit doctor review
- `GET /reviews` - Get all reviews

#### Resources
- `GET /articles` - Get educational articles
- `GET /pharmacy` - Get pharmacy directory
- `GET /medicine` - Browse medicine catalog
- `GET /charities` - List charity organizations

#### Payments
- `POST /orders/checkout-session` - Create Stripe checkout
- `GET /orders` - Get user orders
- `POST /webhook-checkout` - Stripe webhook handler

#### AI Services
- `GET /ai/screening/question/:index` - Get screening question
- `POST /ai/screening/answer` - Submit answer
- `POST /ai/screening/predict` - Get prediction

### Example Request

```bash
# Register a new parent
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "passwordConfirmation": "SecurePass123!",
    "age": 35,
    "phone": "+1234567890",
    "address": "123 Main St, City"
  }'
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # End-to-end tests only

# Watch mode for development
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check code formatting
npm run format:check

# Format code
npm run format
```

**Test Coverage Goals:**
- Unit Tests: 80%+ coverage
- Integration Tests: Key workflows (auth, appointments, payments)
- E2E Tests: Critical user journeys

## 👨‍💻 Developer Guide

### Quick Start for Contributors

```bash
# 1. Fork and clone the repository
git clone https://github.com/3bwahab/asd-healthcare-platform.git
cd asd-healthcare-platform

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example config.env

# 4. Configure your environment variables (see below)

# 5. Start development server
npm run dev
```

### Environment Setup Guide

#### MongoDB Atlas Configuration

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster (M0 free tier)
3. Navigate to **Database Access** → Add database user
4. Navigate to **Network Access** → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)
5. Click **Connect** → **Connect your application**
6. Copy connection string and add to `config.env`:
   ```env
   DB_URL=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/asd_healthcare?retryWrites=true&w=majority
   ```

#### Cloudinary Configuration

1. Sign up at [Cloudinary](https://cloudinary.com/users/register/free)
2. Navigate to **Dashboard** → Copy **Cloud Name**, **API Key**, **API Secret**
3. Add to `config.env`:
   ```env
   CLOUD_NAME=your-cloud-name
   API_KEY=123456789012345
   API_SECRET=abcdefghijklmnopqrstuvwxyz
   ```

#### Stripe Configuration

1. Create account at [Stripe](https://dashboard.stripe.com/register)
2. Toggle **View test data** in dashboard
3. Navigate to **Developers** → **API keys**
4. Copy **Publishable key** and **Secret key**
5. Add to `config.env`:
   ```env
   STRIPE_PUBLIC=pk_test_51...
   STRIPE_SECRET=sk_test_51...
   ```

**Setting up Webhooks for Local Development:**

```bash
# Install Stripe CLI
# Windows (using scoop): scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git && scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/api/v1/webhook-checkout

# Copy the webhook signing secret (starts with whsec_) to config.env
WEBHOOK_SECRET=whsec_...
```

#### Gmail Configuration

1. Enable 2-Step Verification on your Google account
2. Go to **Google Account** → **Security** → **2-Step Verification** → **App passwords**
3. Select **Mail** and **Other (Custom name)**
4. Copy the 16-character password
5. Add to `config.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # Remove spaces
   ```

#### FastAPI AI Service

```bash
# Navigate to FastAPI directory (if separate)
cd fastapi-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --reload --port 8080

# Add to config.env:
FASTAPI_URL=http://localhost:8080
```

### Project Structure

```
asd-healthcare-platform/
├── config/              # Configuration files
│   └── database.js      # MongoDB connection
├── docs/                # Documentation
│   ├── diagrams/        # Mermaid diagrams (ERD, UML, etc.)
│   ├── ARCHITECTURE.md  # System architecture
│   └── API_EXAMPLES.md  # API usage examples
├── middleware/          # Express middleware
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validatorMiddleware.js
├── models/              # Mongoose schemas
│   ├── parentModel.js
│   ├── doctorModel.js
│   ├── childModel.js
│   ├── appointmentModel.js
│   └── ...
├── routes/              # Express routes
│   ├── authRoutes.js
│   ├── parentRoutes.js
│   └── ...
├── services/            # Business logic layer
│   ├── authServices.js
│   ├── appointmentServices.js
│   └── ...
├── utils/               # Helper utilities
│   ├── ApiError.js
│   ├── ApiFeatures.js
│   ├── sendEmail.js
│   └── validators/
├── tests/               # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example         # Environment template
├── .gitignore
├── index.js             # Application entry point
├── package.json
└── README.md
```

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following coding standards:
   - Use ESLint (Airbnb style guide)
   - Format with Prettier
   - Write tests for new features
   - Update documentation

3. **Run tests and linting:**
   ```bash
   npm run lint
   npm test
   ```

4. **Commit with conventional commits:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

   **Commit Types:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `test:` Adding or updating tests
   - `refactor:` Code refactoring
   - `chore:` Maintenance tasks

5. **Push and create pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Troubleshooting

#### Database Connection Issues

**Error:** `MongooseServerSelectionError: Could not connect to any servers`

**Solutions:**
- Verify MongoDB Atlas network access allows your IP (`0.0.0.0/0` for development)
- Check DB_URL in `config.env` has correct username/password
- Ensure special characters in password are URL-encoded
- Test connection string in MongoDB Compass

#### JWT Token Errors

**Error:** `JsonWebTokenError: invalid token`

**Solutions:**
- Verify JWT_SECRET_KEY is set in `config.env`
- Check token format: `Authorization: Bearer <token>`
- Ensure token hasn't expired (default 90 days)
- Clear browser cookies/localStorage and login again

#### CORS Errors

**Error:** `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solutions:**
- Add your frontend URL to `ALLOWED_ORIGINS` in `config.env`:
  ```env
  ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
  ```
- Restart the server after changing config

#### Docker Issues

**Error:** `Cannot start service: Ports are not available`

**Solutions:**
- Check if port 8000 or 27017 is already in use:
  ```bash
  # Windows
  netstat -ano | findstr :8000

  # Mac/Linux
  lsof -i :8000
  ```
- Kill the process or change port in `docker-compose.yml`

#### Stripe Webhook Failures

**Error:** `Webhook signature verification failed`

**Solutions:**
- Verify `WEBHOOK_SECRET` matches Stripe CLI output
- Ensure raw body parser is enabled (already configured in `index.js`)
- Check Stripe CLI is running: `stripe listen --forward-to localhost:8000/api/v1/webhook-checkout`

### Additional Resources

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Detailed system design and component documentation
- **[API_EXAMPLES.md](docs/API_EXAMPLES.md)** - Complete API request/response examples
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and code of conduct
- **[Mermaid Diagrams](docs/diagrams/)** - Visual documentation (ERD, UML, sequence diagrams)

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/3bwahab/asd-healthcare-platform/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/3bwahab/asd-healthcare-platform/discussions)
- **Email**: Contact maintainers for sensitive issues

## 🚢 Deployment

### Vercel (Recommended for API)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Docker Production

```bash
# Build production image
docker build -t asd-api:prod --target production .

# Run production container
docker run -p 8000:8000 --env-file config.env asd-api:prod
```

### Environment Variables

Ensure all environment variables are set in your deployment platform:
- MongoDB Atlas connection string
- JWT secret key
- Stripe API keys
- Cloudinary credentials
- Email credentials

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Commit message conventions
- Pull request process

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Stripe** for payment processing infrastructure
- **Cloudinary** for media management
- **MongoDB Atlas** for database hosting
- **FastAPI** community for ML integration patterns

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for the ASD community**
