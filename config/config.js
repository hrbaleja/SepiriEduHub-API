const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
module.exports = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI ,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // SMTP
  SMTP: {
    HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.SMTP_PORT) || 587,
    SECURE: process.env.SMTP_SECURE === 'true',
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASS
  },
  
  // Programs
  PROGRAMS: {
    'MCX': 'Multi Commodity Exchange',
    'CDSL': 'Central Depository Services Limited',
    'BSE': 'Bombay Stock Exchange',
    'NSE': 'National Stock Exchange',
    'NSDL': 'National Securities Depository Limited'
  },
  
  // File Paths
  PATHS: {
    ROOT: ROOT_DIR,
    CERTIFICATES: './data/certificates',
    UPLOADS: './data/uploads',
    LOGS: path.join(ROOT_DIR, 'logs'),
    INSTITUTES: path.join(ROOT_DIR, 'data'),
  },
  
  // Certificate
  CERTIFICATE: {
    WIDTH: 1920,
    HEIGHT: 1080,
    INSTITUTE_NAME: 'Sepiri EduHub',
    TAGLINE: 'Excellence in Financial Education'
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  }
};
