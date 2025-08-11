# DB Skills Training Portal

A mobile-responsive web application for managing candidate verification, registration, and status tracking in training programs.

## Features

- **Candidate Verification**: OTP-based mobile verification and Aadhar document scanning
- **Registration**: New candidate registration with auto-filled data
- **Status Check**: Real-time candidate status tracking and search
- **Mobile Responsive**: Optimized for tablets and mobile devices
- **Real-time Data**: MongoDB integration for live data storage and retrieval

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: OTP verification via Twilio (optional)
- **File Upload**: Aadhar document processing

## Prerequisites

Before running this application, make sure you have:

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## MongoDB Setup

### Option 1: Local MongoDB Installation

1. **Install MongoDB Community Edition**:
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **macOS**: `brew install mongodb-community`
   - **Ubuntu**: 
     ```bash
     sudo apt-get install gnupg
     wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
     echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
     sudo apt-get update
     sudo apt-get install -y mongodb-org
     ```

2. **Start MongoDB Service**:
   - **Windows**: MongoDB starts automatically as a service
   - **macOS**: `brew services start mongodb-community`
   - **Ubuntu**: `sudo systemctl start mongod`

3. **Verify Installation**:
   ```bash
   mongo --version
   # or for newer versions
   mongosh --version
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address
5. Get connection string from "Connect" button

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd db-skills-portal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # For Local MongoDB
   MONGODB_URI=mongodb://localhost:27017/db-skills-portal
   
   # For MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db-skills-portal
   
   PORT=5000
   NODE_ENV=development
   VITE_API_URL=http://localhost:5000/api
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Optional: Twilio for real SMS
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   ```

4. **Database Setup**:
   
   The application will automatically create the database and collections when you first run it. No manual database setup required!

## Running the Application

### Development Mode

1. **Start both frontend and backend**:
   ```bash
   npm run dev:full
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:5173`

2. **Or run separately**:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend  
   npm run dev
   ```

### Production Mode

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   NODE_ENV=production node server/server.js
   ```

## API Endpoints

### Candidate Management
- `POST /api/candidates/send-otp` - Send OTP to mobile number
- `POST /api/candidates/verify-otp` - Verify OTP
- `POST /api/candidates/check-record` - Check if candidate exists
- `POST /api/candidates/register` - Register new candidate
- `GET /api/candidates/search` - Search candidate by Aadhar/Mobile
- `GET /api/candidates/all` - Get all candidates (paginated)
- `PATCH /api/candidates/:id/status` - Update candidate status

### Health Check
- `GET /api/health` - API health status

## Database Schema

### Candidates Collection
```javascript
{
  name: String,
  dob: Date,
  aadharNumber: String, // Format: "1234-5678-9012"
  mobile: String, // 10 digits
  address: String,
  program: String,
  category: String,
  center: String,
  trainer: String,
  duration: String,
  candidateId: String, // Auto-generated: "DB123456"
  status: String, // "Enrolled", "In Progress", "Completed", "Dropped"
  isVerified: Boolean,
  enrollmentDate: Date,
  completionDate: Date
}
```

### OTP Collection
```javascript
{
  mobile: String,
  otp: String, // 4 digits
  expiresAt: Date, // 5 minutes from creation
  verified: Boolean
}
```

## Features in Detail

### 1. Candidate Verification Screen
- Mobile number input with OTP verification
- Aadhar document upload/scanning with auto-fill
- Duplicate candidate checking
- Real-time validation

### 2. Registration Screen
- Auto-filled personal information from Aadhar
- Program category selection with auto-duration
- Training center and trainer assignment
- Form validation and error handling

### 3. Status Check Screen
- Search by Aadhar number or mobile number
- Real-time candidate information display
- Status tracking (Enrolled/Completed/etc.)
- Responsive search results

## Troubleshooting

### MongoDB Connection Issues
1. **Local MongoDB not starting**:
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   ```

2. **Atlas connection issues**:
   - Verify connection string format
   - Check IP whitelist settings
   - Ensure database user has proper permissions

### Port Conflicts
If ports 5000 or 5173 are in use:
```bash
# Kill processes using the ports
sudo lsof -ti:5000 | xargs kill -9
sudo lsof -ti:5173 | xargs kill -9
```

### Environment Variables
Make sure `.env` file is in the root directory and contains all required variables.

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is licensed under the MIT License.