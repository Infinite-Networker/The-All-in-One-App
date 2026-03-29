/**
 * The All-in-One App — User Model
 * Cherry Computer Ltd.
 *
 * The central user document — holds platform connections,
 * preferences, and analytics snapshots.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM CONNECTION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const PlatformConnectionSchema = new mongoose.Schema({
  platformId: {
    type: String,
    required: true,
    enum: ['instagram', 'twitter', 'facebook', 'tiktok', 'linkedin', 'youtube'],
  },
  platformUserId: { type: String, required: true },
  username: { type: String, required: true },
  displayName: { type: String },
  avatarUrl: { type: String },

  // Encrypted token storage
  encryptedAccessToken: { type: String, required: true, select: false },
  encryptedRefreshToken: { type: String, select: false },
  tokenExpiresAt: { type: Date },
  scopes: [{ type: String }],

  connectedAt: { type: Date, default: Date.now },
  lastSyncedAt: { type: Date },
  isActive: { type: Boolean, default: true },

  // Platform-specific metadata
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { _id: false });

// ─────────────────────────────────────────────────────────────────────────────
// ENGAGEMENT PREFERENCES SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const EngagementPreferencesSchema = new mongoose.Schema({
  defaultAction: {
    type: String,
    enum: ['like', 'comment', 'follow', 'all'],
    default: 'like',
  },
  defaultComment: { type: String, default: '', maxlength: 280 },
  autoFollowOnLike: { type: Boolean, default: false },
  enabledPlatforms: {
    type: [String],
    default: ['instagram', 'twitter', 'facebook', 'tiktok', 'linkedin', 'youtube'],
  },
  // Schedule: { dayOfWeek: [0-6], hourStart: 0-23, hourEnd: 0-23 }
  schedule: { type: mongoose.Schema.Types.Mixed, default: null },
  rateLimitPerPlatform: { type: Number, default: 100 }, // actions/hour
}, { _id: false });

// ─────────────────────────────────────────────────────────────────────────────
// USER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  // Core identity
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters'],
  },
  avatarUrl: { type: String },

  // Authentication
  passwordHash: { type: String, select: false },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },

  // Platform connections
  platforms: [PlatformConnectionSchema],

  // App preferences
  preferences: {
    type: EngagementPreferencesSchema,
    default: () => ({}),
  },

  // UI settings
  theme: {
    type: String,
    enum: ['dark', 'light', 'system'],
    default: 'dark',
  },
  language: { type: String, default: 'en' },
  timezone: { type: String, default: 'UTC' },

  // Account status
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  lastLoginAt: { type: Date },
  loginCount: { type: Number, default: 0 },

  // Subscription
  plan: {
    type: String,
    enum: ['free', 'creator', 'pro', 'enterprise'],
    default: 'free',
  },
  planExpiresAt: { type: Date },

  // Analytics snapshot (cached)
  analyticsSnapshot: {
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalFollows: { type: Number, default: 0 },
    lastCalculatedAt: { type: Date },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (_, ret) => { delete ret.passwordHash; return ret; } },
  toObject: { virtuals: true },
});

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ 'platforms.platformId': 1, 'platforms.platformUserId': 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ plan: 1, isActive: 1 });

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────────────

UserSchema.virtual('connectedPlatformCount').get(function () {
  return this.platforms.filter(p => p.isActive).length;
});

UserSchema.virtual('isPro').get(function () {
  return ['pro', 'enterprise'].includes(this.plan) &&
    (!this.planExpiresAt || this.planExpiresAt > new Date());
});

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

UserSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash') && !this.passwordHash?.startsWith('$2')) {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    this.passwordChangedAt = new Date();
  }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────────────────────────────────────────

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

UserSchema.methods.getPlatformConnection = function (platformId) {
  return this.platforms.find(p => p.platformId === platformId && p.isActive);
};

UserSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return token;
};

// ─────────────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────────────

UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
