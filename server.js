require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const config = require('./config/config');

const app = express();

// ===================================
// CORS Configuration - Allow Localhost + Your IP
// ===================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'httphttp://192.168.1.89:3000',  // Replace with your local IP
  'http://192.168.0.100:3000',  // Replace with your local IP
  'http://10.0.0.100:3000',     // Replace with your local IP
  // Add your actual IP addresses here
  process.env.FRONTEND_URL,      // From environment variable
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For development, allow all localhost and IP addresses
      if (
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin.match(/http:\/\/192\.168\.\d{1,3}\.\d{1,3}/) ||
        origin.match(/http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}/) ||
        origin.match(/http:\/\/172\.\d{1,3}\.\d{1,3}\.\d{1,3}/)
      ) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ===================================
// Security & Middleware
// ===================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting (more lenient for development)
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT?.WINDOW_MS || 15 * 60 * 1000,
  max: config.RATE_LIMIT?.MAX_REQUESTS || 1000, // Higher limit
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Static files
app.use('/certificates', express.static(config.PATHS?.CERTIFICATES || './data/certificates'));

// ===================================
// Database Connection
// ===================================
if (config.MONGODB_URI) {
  connectDB();
} else {
  console.warn('⚠️  MongoDB URI not configured. Some features may not work.');
}

// ===================================
// Routes
// ===================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/institutes', require('./routes/instituteRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));

// ===================================
// Health Check
// ===================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sepiri EduHub API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV || 'development',
    database: config.MONGODB_URI ? 'Configured' : 'Not configured',
    cors: 'Enabled for localhost and local network'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Sepiri EduHub API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      institutes: '/api/institutes/*',
      certificates: '/api/certificates/*'
    }
  });
});

// ===================================
// 404 Handler
// ===================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// ===================================
// Error Handler
// ===================================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy: Origin not allowed',
      hint: 'Access from localhost, 127.0.0.1, or local network IP'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===================================
// Start Server (Local Development)
// ===================================
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   📜 Sepiri EduHub API - Production Ready             ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`\n🚀 Server: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
    console.log(`🔧 Environment: ${config.NODE_ENV || 'development'}`);
    console.log(`📧 SMTP: ${config.SMTP?.USER || 'NOT CONFIGURED'}`);
    console.log(`💾 Database: ${config.MONGODB_URI ? 'Connected' : 'Not configured'}`);
    console.log(`\n🌍 CORS enabled for:`);
    console.log(`   - http://localhost:3000`);
    console.log(`   - http://127.0.0.1:3000`);
    console.log(`   - http://192.168.x.x:3000 (local network)`);
    console.log(`   - http://10.x.x.x:3000 (local network)`);
    console.log(`\n💡 Get your local IP: ipconfig (Windows) or ifconfig (Mac/Linux)`);
    console.log(`\n✨ Ready to accept requests!\n`);
    
    if (!config.SMTP?.USER || !config.SMTP?.PASS) {
      console.log('⚠️  WARNING: SMTP not configured for email sending\n');
    }
  });
}

// Export for Vercel
module.exports = app;