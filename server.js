process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const config = require('./config/config');
const apiRoutes = require('./routes');
const PORT = process.env.PORT || 5000;

const app = express();

app.set('trust proxy', 1);
// Connect to MongoDB
// connectDB();


// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later'
});
// app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
    res.send('Welcome to my Node.js backend!');
});


app.use('/api/v1', apiRoutes);

// app.use('api/v1', apiRoutes);

// Static files
app.use('/certificates', express.static(config.PATHS.CERTIFICATES));

// Routes


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sepiri EduHub API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: 'MongoDB Connected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   📜 Sepiri EduHub - Production Certificate System    ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`\n🚀 Server: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${config.NODE_ENV}`);
    console.log(`✨ Ready to generate certificates!\n`);
  });
};

startServer();


module.exports = app;
