require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes');

const app = express();

// ===================================
// CORS Configuration - FIX FOR VERCEL
// ===================================
app.use((req, res, next) => {
  // Allow all origins in development, specific in production
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Legacy CORS middleware (keep as backup)
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true); // Allow all origins
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    cachedDb = connection;
    console.log('✅ MongoDB Connected');
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
}

// Connect on startup
if (process.env.MONGODB_URI) {
  connectToDatabase().catch(console.error);
}

// ===================================
// Health Check
// ===================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sepiri EduHub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    cors: 'Enabled for all origins'
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Sepiri EduHub API',
    version: '2.0.0',
    status: 'running',
    message: 'Use /api/health for health check'
  });
});

// ===================================
// Add Your Routes Here
// ===================================
app.use('/api/v1', apiRoutes);
// Example: app.use('/api/auth', require('./routes/auth'));
// Example: app.use('/api/institutes', require('./routes/institutes'));

// ===================================
// Error Handler
// ===================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
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
// Export for Vercel
// ===================================
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 CORS enabled for all origins`);
  });
}