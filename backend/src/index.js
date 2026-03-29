/**
 * The All-in-One App — Backend Entry Point
 * Cherry Computer Ltd.
 *
 * Node.js + Express server powering the All-in-One App.
 * Designed for scalability, security, and real-time performance.
 *
 * Author: Dr. Ahmad Mateen Ishanzai
 * Organisation: Cherry Computer Ltd.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const compression = require('compression');

const { connectMongoDB, connectRedis } = require('./config/database');
const { generalLimiter } = require('./middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// APP SETUP
// ─────────────────────────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

const io = new SocketIO(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Make io accessible to controllers via app.locals
app.locals.io = io;

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Platform-Token'],
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
app.use('/api', generalLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

app.use('/api/auth', require('./routes/auth'));
app.use('/api/engagement', require('./routes/engagement'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/proxy', require('./routes/proxy'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'The All-in-One App API',
    company: 'Cherry Computer Ltd.',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
  });
});

// API root info
app.get('/api', (req, res) => {
  res.json({
    service: 'The All-in-One App · REST API',
    company: 'Cherry Computer Ltd.',
    version: '1.0.0',
    author: 'Dr. Ahmad Mateen Ishanzai',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      engagement: '/api/engagement',
      feed: '/api/feed',
      analytics: '/api/analytics',
      accounts: '/api/accounts',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred.'
    : err.message;

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WEBSOCKET — REAL-TIME FEED SYNC
// ─────────────────────────────────────────────────────────────────────────────

io.use(async (socket, next) => {
  // Authenticate WebSocket connections using JWT
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`🔌 WebSocket connected: user ${userId}`);

  // Join user-specific room for targeted events
  socket.join(`user:${userId}`);

  // Client can subscribe to specific platforms
  socket.on('subscribe:platform', (platformId) => {
    socket.join(`platform:${platformId}:${userId}`);
  });

  socket.on('unsubscribe:platform', (platformId) => {
    socket.leave(`platform:${platformId}:${userId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 WebSocket disconnected: user ${userId} (${reason})`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const start = async () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   🍒  The All-in-One App · Backend        ║');
  console.log('║   Cherry Computer Ltd.                    ║');
  console.log('║   Dr. Ahmad Mateen Ishanzai               ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');

  await connectMongoDB();
  connectRedis();

  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   API root: http://localhost:${PORT}/api`);
    console.log('');
  });
};

start().catch(err => {
  console.error('💥 Failed to start server:', err);
  process.exit(1);
});

module.exports = { app, server, io };
