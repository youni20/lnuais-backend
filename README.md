# LNU AIS Backend

Complete Express.js/Node.js backend for the Linnaeus University AI Society website.

## Features

- ✅ **User Management**: Registration, Profile Updates, Listing
- ✅ **Authentication**:
    - Google OAuth 2.0
    - Email/Password Login
    - Email Verification (6-digit codes)
    - Password Reset
    - Session Management (PostgreSQL store)
- ✅ **Security**: bcrypt hashing, CORS, Helmet (recommended), Protected Routes
- ✅ **Infrastructure**: AWS RDS (PostgreSQL), AWS Elastic Beanstalk ready

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (AWS RDS)
- **ORM**: Sequelize
- **Auth**: Passport.js (Google), bcrypt, express-session
- **Email**: Nodemailer (Gmail SMTP)

## Setup & Local Development

1. **Clone the repository**
   ```bash
   git clone git@github.com:youni20/lnuais-backend.git
   cd lnuais-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   DB_HOST=...
   DB_USER=...
   DB_PASSWORD=...
   DB_NAME=postgres
   
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   
   MAIL_USERNAME=...
   MAIL_PASSWORD=...
   
   SESSION_SECRET=...
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Run the server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- **POST** `/api/auth/login`: Login with email/password.
- **POST** `/api/auth/verify-email`: Verify account with code.
- **GET** `/api/auth/google`: Start Google OAuth flow.
- **POST** `/api/auth/request-password-reset`: Request reset code.
- **POST** `/api/auth/reset-password`: Reset password with code.
- **GET** `/api/auth/logout`: Logout.
- **GET** `/api/auth/current-user`: Get session user.

### Users
- **POST** `/api/users/register`: Register new user.
- **GET** `/api/users`: Get all users (paginated).
- **GET** `/api/users/:id`: Get user details.
- **PUT** `/api/users/:id`: Update user (Protected).
- **DELETE** `/api/users/:id`: Delete user (Protected).

## Deployment to AWS Elastic Beanstalk

1. **Initialize EB**
   ```bash
   eb init -p node.js lnuais-backend --region eu-north-1
   ```

2. **Create Environment**
   ```bash
   eb create lnuais-backend-prod
   ```

3. **Set Environment Variables**
   ```bash
   eb setenv DB_HOST=... GOOGLE_CLIENT_ID=... # Set all vars
   ```

## Database Schema
The `users` table includes:
- OAuth fields (`google_id`)
- Verification fields (`verification_code`, `is_verified`)
- Standard profile fields (`full_name`, `email`, `programme`)
