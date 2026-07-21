const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Logging middleware in dev mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// System Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'SAHAKARA ERP API Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    architecture: 'Multi-Tenant RBAC Cooperative ERP',
  });
});

const path = require('path');

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Modules
app.use('/api/v1/landing', require('./routes/landingRoutes'));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/super-admin', require('./routes/superAdminRoutes'));
app.use('/api/v1/organizations', require('./routes/orgRoutes'));
app.use('/api/v1/branches', require('./routes/branchRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/members', require('./routes/memberRoutes'));
app.use('/api/v1/roles', require('./routes/roleRoutes'));
app.use('/api/v1/groups', require('./routes/groupRoutes'));
app.use('/api/v1/savings', require('./routes/savingsRoutes'));
app.use('/api/v1/loans', require('./routes/loanRoutes'));
app.use('/api/v1/repayments', require('./routes/repaymentRoutes'));
app.use('/api/v1/accounting', require('./routes/accountingRoutes'));
app.use('/api/v1/transactions', require('./routes/transactionRoutes'));
app.use('/api/v1/meetings', require('./routes/meetingRoutes'));
// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `API Route Not Found - ${req.originalUrl}`,
  });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`   SAHAKARA ERP API Engine Running on Port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[Unhandled Error]: ${err.message}`);
  // Keep server running in dev
});
