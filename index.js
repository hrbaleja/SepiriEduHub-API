require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



const app = express();

// ===================================
// CORS Configuration
// ===================================
const ALLOWED_ORIGINS = [
  'https://sepiri.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===================================
// MongoDB Connection - FIXED FOR VERCEL
// ===================================
let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in environment variables');
    return;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB Connected Successfully');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    isConnected = false;
  }
}

// ===================================
// Routes
// ===================================
app.get('/api/health', async (req, res) => {
  try {
    // Try to connect on each health check
    await connectDB();
    
    res.json({
      success: true,
      message: 'Sepiri EduHub API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: isConnected ? 'Connected' : 'Disconnected',
      mongodbState: mongoose.connection.readyState,
      mongodbUriSet: !!process.env.MONGODB_URI,
      cors: 'Enabled'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message,
      database: 'Error'
    });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    name: 'Sepiri EduHub API', 
    status: 'running',
    database: isConnected ? 'Connected' : 'Disconnected'
  });
});

// Middleware to ensure DB connection before routes
app.use('/api/v1', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed' 
    });
  }
});

// Load API routes if available
try {
  const apiRoutes = require('./routes');
  app.use('/api/v1', apiRoutes);
} catch (err) {
  console.log('⚠️ Routes not loaded:', err.message);
  app.all('/api/v1/*', (req, res) => {
    res.status(404).json({ 
      success: false, 
      error: 'API routes not configured yet' 
    });
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false, 
    error: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Not found' 
  });
});

// Export for Vercel
module.exports = app;

// Local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Server: http://localhost:${PORT}`);
      console.log(`💾 MongoDB: ${isConnected ? 'Connected' : 'Disconnected'}`);
      console.log(`🌍 CORS: ${ALLOWED_ORIGINS.join(', ')}\n`);
    });
  });
}