# ASD Healthcare Management Platform

> A comprehensive healthcare management system for Autism Spectrum Disorder (ASD) support services

## Overview

The ASD Healthcare Management Platform is a RESTful API designed to connect parents of children with autism spectrum disorder to healthcare professionals, educational resources, therapy sessions, and support services.

## Features

- **User Management**: Parent and doctor registration with JWT authentication
- **Healthcare Services**: Appointment booking, therapy sessions, and progress tracking
- **AI Integration**: Autism screening questionnaires with ML-powered predictions
- **Educational Resources**: Articles and guides for ASD support
- **Payment Processing**: Secure payment integration via Stripe
- **File Management**: Cloudinary integration for document and image uploads
- **Email Notifications**: Automated email notifications for appointments and updates

## Tech Stack

- **Runtime**: Node.js >= 18.0.0
- **Framework**: Express.js 4.21.1
- **Database**: MongoDB (Mongoose ODM 8.8.3)
- **Authentication**: JWT + bcrypt
- **External Services**:
  - Stripe (Payments)
  - Cloudinary (File Storage)
  - Gmail SMTP (Email)
  - FastAPI (AI/ML Services)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas account
- Stripe account (test mode)
- Cloudinary account
- Gmail account with app password

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ASD_Final_Project

# Install dependencies
npm install

# Configure environment variables
cp .env.example config.env
# Edit config.env with your credentials

# Start development server
npm run dev
```

## License

MIT

## Status

🚧 **Work in Progress** - This project is under active development
