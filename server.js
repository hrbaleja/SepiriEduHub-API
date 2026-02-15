require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('../config/db');
const config = require('../config/config');
const apiRoutes = require('../routes');

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Connect DB (cached connection recommended)
connectDB();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter (optional)
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
});
app.use('/api', limiter);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Sepiri EduHub API');
});

app.use('/api/v1', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 🔥 EXPORT ONLY (NO LISTEN)
module.exports = app;
