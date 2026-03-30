/**
 * The All-in-One App — Engagement Log Model
 * Cherry Computer Ltd.
 *
 * Records every engagement action for analytics and audit purposes.
 * Each document represents one platform-level action (like, comment, follow)
 * that was triggered by the one-tap engine.
 */

const mongoose = require('mongoose');

const engagementLogSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // Which platform this engagement fired on
    platform: {
      type:     String,
      required: true,
      enum:     ['instagram', 'twitter', 'facebook', 'tiktok', 'linkedin', 'youtube'],
      index:    true,
    },

    // What action was taken
    action: {
      type:     String,
      required: true,
      enum:     ['like', 'comment', 'follow', 'all'],
    },

    // The content that was engaged with
    contentId:   { type: String },
    contentType: {
      type: String,
      enum: ['post', 'tweet', 'video', 'reel', 'short', 'article', 'story'],
    },
    contentUrl: { type: String },

    // The comment text if applicable
    commentText: { type: String, maxlength: 280 },

    // Result
    status: {
      type:    String,
      enum:    ['success', 'failed', 'pending'],
      default: 'pending',
      index:   true,
    },
    errorMessage: { type: String },

    // Platform response data (e.g., new like count, comment ID)
    responseData: { type: mongoose.Schema.Types.Mixed },

    // Timing
    firedAt:     { type: Date, default: Date.now },
    completedAt: { type: Date },
    durationMs:  { type: Number },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────

engagementLogSchema.index({ userId: 1, createdAt: -1 });
engagementLogSchema.index({ userId: 1, platform: 1, createdAt: -1 });
engagementLogSchema.index({ userId: 1, status: 1 });

// TTL index — auto-delete logs older than 1 year
engagementLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 3600 });

// ─── Statics ──────────────────────────────────────────────────────────────

/**
 * Log a batch of engagement results (one per platform in a multi-platform fire).
 */
engagementLogSchema.statics.logBatch = async function (userId, action, results) {
  const docs = results.map((result) => ({
    userId,
    platform:    result.platform,
    action,
    contentId:   result.contentId,
    contentType: result.contentType,
    commentText: result.commentText,
    status:      result.status,
    errorMessage: result.error,
    responseData: result.data,
    firedAt:     result.firedAt,
    completedAt: result.completedAt,
    durationMs:  result.durationMs,
  }));

  return this.insertMany(docs, { ordered: false });
};

const EngagementLog = mongoose.model('EngagementLog', engagementLogSchema);
module.exports = EngagementLog;
