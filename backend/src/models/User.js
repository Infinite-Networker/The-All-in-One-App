/**
 * The All-in-One App — User Model
 * Cherry Computer Ltd.
 *
 * Core user schema. Platform connections are stored as an embedded
 * map — each platform key holds its encrypted token data and status.
 * Password hashes use bcrypt. Tokens are AES-256 encrypted before storage.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const platformConnectionSchema = new mongoose.Schema(
  {
    connected:    { type: Boolean, default: false },
    accessToken:  { type: String, select: false },  // AES-256 encrypted
    refreshToken: { type: String, select: false },  // AES-256 encrypted
    expiresAt:    { type: Date },
    username:     { type: String },
    displayName:  { type: String },
    profileImage: { type: String },
    followerCount:{ type: Number, default: 0 },
    connectedAt:  { type: Date },
    lastSyncedAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type:     String,
      required: true,
      unique:   true,
      lowercase: true,
      trim:     true,
      index:    true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    passwordHash: {
      type:   String,
      select: false,  // Never returned in queries by default
    },
    avatarUrl: { type: String },

    // Per-platform connection state
    platforms: {
      instagram: { type: platformConnectionSchema, default: () => ({}) },
      twitter:   { type: platformConnectionSchema, default: () => ({}) },
      facebook:  { type: platformConnectionSchema, default: () => ({}) },
      tiktok:    { type: platformConnectionSchema, default: () => ({}) },
      linkedin:  { type: platformConnectionSchema, default: () => ({}) },
      youtube:   { type: platformConnectionSchema, default: () => ({}) },
    },

    // Engagement preferences
    preferences: {
      defaultComment:    { type: String, maxlength: 280, default: '' },
      quietHoursStart:   { type: Number, default: 22 }, // Hour in local time (0–23)
      quietHoursEnd:     { type: Number, default: 8 },
      enableAutoEngage:  { type: Boolean, default: false },
      theme:             { type: String, enum: ['dark', 'light'], default: 'dark' },
    },

    // Metadata
    lastSeenAt: { type: Date },
    isActive:   { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────

userSchema.virtual('connectedPlatformCount').get(function () {
  return Object.values(this.platforms || {}).filter((p) => p.connected).length;
});

// ─── Hooks ────────────────────────────────────────────────────────────────

userSchema.pre('save', async function (next) {
  // Only hash if password was modified
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// ─── Methods ──────────────────────────────────────────────────────────────

userSchema.methods.verifyPassword = async function (plaintext) {
  return bcrypt.compare(plaintext, this.passwordHash);
};

/**
 * Returns a safe public representation of the user (no sensitive fields).
 */
userSchema.methods.toPublic = function () {
  return {
    id:                      this._id,
    email:                   this.email,
    displayName:             this.displayName,
    avatarUrl:               this.avatarUrl,
    connectedPlatformCount:  this.connectedPlatformCount,
    platforms: Object.fromEntries(
      Object.entries(this.platforms || {}).map(([id, p]) => [
        id,
        {
          connected:     p.connected,
          username:      p.username,
          displayName:   p.displayName,
          profileImage:  p.profileImage,
          followerCount: p.followerCount,
          connectedAt:   p.connectedAt,
        },
      ])
    ),
    preferences:  this.preferences,
    createdAt:    this.createdAt,
    lastSeenAt:   this.lastSeenAt,
  };
};

// ─── Indexes ──────────────────────────────────────────────────────────────

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
