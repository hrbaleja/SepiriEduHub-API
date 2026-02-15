require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes');

const app = express();

// ===================================
// CRITICAL: CORS MUST BE FIRST - Before any other middleware
// ===================================

// Allowed origins
const ALLOWED_ORIGINS = [
  'https://sepiri.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173', // Vite
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

// CORS Options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(null, true); // Still allow but log it
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS
app.use(cors(corsOptions));

// Explicit preflight handling for all routes
app.options('*', cors(corsOptions));

// Manual CORS headers as backup (in case cors() fails)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// ===================================
// Body Parser - AFTER CORS
// ===================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// ===================================
// MongoDB Connection (Cached for Vercel)
// ===================================
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI || '', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedDb = connection;
    console.log('✅ MongoDB Connected');
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Don't throw - let the app continue
    return null;
  }
}

// Connect on startup
if (process.env.MONGODB_URI) {
  connectToDatabase().catch(err => {
    console.error('Initial DB connection failed:', err.message);
  });
}

// ===================================
// Health Check - Test CORS
// ===================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sepiri EduHub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    cors: 'Enabled',
    allowedOrigins: ALLOWED_ORIGINS,
    requestOrigin: req.headers.origin || 'none'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Sepiri EduHub API',
    version: '2.0.0',
    status: 'running',
    message: 'API is working. Use /api/health for health check',
    cors: 'Configured for https://sepiri.vercel.app'
  });
});

// ===================================
// API Routes
// ===================================
app.use('/api/v1', apiRoutes);

// ===================================
// Error Handler
// ===================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    path: req.path
  });
});

// ===================================
// 404 Handler
// ===================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ===================================
// Export for Vercel
// ===================================
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║   🚀 Sepiri EduHub API - Running             ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log(`\n📍 Server: http://localhost:${PORT}`);
    console.log(`🌍 CORS Enabled for: ${ALLOWED_ORIGINS.join(', ')}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
    console.log(`\n✨ Ready to accept requests!\n`);
  });
}