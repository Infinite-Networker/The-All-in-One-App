/**
 * The All-in-One App — Engagement Log Model
 * Cherry Computer Ltd.
 *
 * Every engagement action is logged here for analytics,
 * rate limiting, and audit purposes.
 */

const mongoose = require('mongoose');

const EngagementLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // What platform and action
  platform: {
    type: String,
    required: true,
    enum: ['instagram', 'twitter', 'facebook', 'tiktok', 'linkedin', 'youtube'],
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['like', 'comment', 'follow', 'unfollow', 'unlike'],
  },

  // Target content
  contentId: { type: String, required: true },
  contentType: {
    type: String,
    enum: ['post', 'video', 'tweet', 'reel', 'story', 'article'],
    default: 'post',
  },
  targetUserId: { type: String },

  // Result
  status: {
    type: String,
    enum: ['success', 'failed', 'rate_limited', 'skipped'],
    required: true,
    index: true,
  },
  errorMessage: { type: String },

  // Batch engagement tracking
  batchId: { type: String, index: true }, // Groups all platforms from one One-Tap action

  // Timing
  executedAt: { type: Date, default: Date.now, index: true },
  responseTimeMs: { type: Number },

}, {
  timestamps: false,
  // TTL: auto-delete logs older than 90 days
  expireAfterSeconds: 90 * 24 * 60 * 60,
});

// Compound indexes for analytics queries
EngagementLogSchema.index({ userId: 1, executedAt: -1 });
EngagementLogSchema.index({ userId: 1, platform: 1, action: 1, executedAt: -1 });
EngagementLogSchema.index({ userId: 1, status: 1, executedAt: -1 });
EngagementLogSchema.index({ batchId: 1 });

// Static method for analytics aggregation
EngagementLogSchema.statics.getAnalyticsSummary = function (userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        executedAt: { $gte: startDate, $lte: endDate },
        status: 'success',
      },
    },
    {
      $group: {
        _id: {
          platform: '$platform',
          action: '$action',
          day: { $dateToString: { format: '%Y-%m-%d', date: '$executedAt' } },
        },
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTimeMs' },
      },
    },
    {
      $group: {
        _id: { platform: '$_id.platform', action: '$_id.action' },
        dailyData: { $push: { day: '$_id.day', count: '$count' } },
        total: { $sum: '$count' },
        avgResponseTime: { $avg: '$avgResponseTime' },
      },
    },
    {
      $sort: { '_id.platform': 1, '_id.action': 1 },
    },
  ]);
};

const EngagementLog = mongoose.model('EngagementLog', EngagementLogSchema);
module.exports = EngagementLog;
