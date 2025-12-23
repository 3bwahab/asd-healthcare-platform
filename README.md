# ASD Healthcare Management Platform

[![CI](https://github.com/username/ASD_Final_Project/workflows/CI/badge.svg)](https://github.com/username/ASD_Final_Project/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> A comprehensive RESTful API for Autism Spectrum Disorder (ASD) healthcare management, connecting families with healthcare professionals, educational resources, and support services.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running Locally](#running-locally)
  - [Running with Docker](#running-with-docker)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

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
git clone https://github.com/username/ASD_Final_Project.git
cd ASD_Final_Project

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
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check code formatting
npm run format:check

# Format code
npm run format
```

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
