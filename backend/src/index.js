/**
 * The All-in-One App — Backend Server Entry Point
 * Cherry Computer Ltd.
 *
 * Express.js server with WebSocket support, Redis caching,
 * MongoDB persistence, and OAuth 2.0 platform integrations.
 *
 * "One Tap. Every Platform. Zero Friction."
 */

'use strict';

const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const { Server } = require('socket.io');

const { connectMongoDB, connectRedis } = require('./config/database');
const { authenticate }                 = require('./middleware/auth');
const logger                           = require('./middleware/logger');

// ─── Route Imports ──────────────────────────────────────────────────────────
const authRoutes       = require('./routes/auth');
const feedRoutes       = require('./routes/feed');
const engagementRoutes = require('./routes/engagement');
const analyticsRoutes  = require('./routes/analytics');

// ─── App Setup ──────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── Socket.IO ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:  process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// Real-time engagement result broadcasting
io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  socket.on('subscribe:feed', (userId) => {
    socket.join(`feed:${userId}`);
    console.log(`[WS] ${socket.id} subscribed to feed:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// Attach io to app so controllers can emit events
app.set('io', io);

// ─── Middleware Stack ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Configured separately for mobile API
}));

app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(logger);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:   'OK',
    app:      'The All-in-One App',
    company:  'Cherry Computer Ltd.',
    version:  '1.0.0',
    env:      NODE_ENV,
    uptime:   process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/feed',       authenticate, feedRoutes);
app.use('/api/engagement', authenticate, engagementRoutes);
app.use('/api/analytics',  authenticate, analyticsRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error:   'Not Found',
    path:    req.path,
    company: 'Cherry Computer Ltd.',
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error:   err.message || 'Internal Server Error',
    company: 'Cherry Computer Ltd.',
  });
});

// ─── Bootstrap ──────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    await connectMongoDB();
    await connectRedis();

    server.listen(PORT, () => {
      console.log('');
      console.log('  ╔════════════════════════════════════════════════╗');
      console.log('  ║       THE ALL-IN-ONE APP — BACKEND SERVER      ║');
      console.log('  ║           Cherry Computer Ltd.                 ║');
      console.log('  ╠════════════════════════════════════════════════╣');
      console.log(`  ║  🚀 Server   →  http://localhost:${PORT}         ║`);
      console.log(`  ║  🌍 Env      →  ${NODE_ENV.padEnd(32)} ║`);
      console.log('  ║  📡 WebSocket  → enabled                       ║');
      console.log('  ║  🍃 MongoDB    → connected                     ║');
      console.log('  ║  ⚡ Redis      → connected                     ║');
      console.log('  ╚════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (err) {
    console.error('[Bootstrap] Fatal error:', err);
    process.exit(1);
  }
}

bootstrap();

module.exports = { app, server, io };
