/**
 * The All-in-One App — Engagement Redux Slice
 * Cherry Computer Ltd.
 *
 * State management for the core engagement engine.
 * Every like, comment, and follow action flows through here.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PlatformService } from '../../services/platforms/PlatformService';

// ─────────────────────────────────────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The flagship action — engage across all platforms simultaneously.
 */
export const engageAll = createAsyncThunk(
  'engagement/engageAll',
  async ({ contentMap, action, comment }, { rejectWithValue }) => {
    try {
      const results = await PlatformService.engageAll({ contentMap, action, comment });
      return results;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Engage with a single platform.
 */
export const engageSingle = createAsyncThunk(
  'engagement/engageSingle',
  async ({ platformId, action, contentId, comment }, { rejectWithValue }) => {
    try {
      const platform = PlatformService.get(platformId);
      switch (action) {
        case 'like':
          await platform.like(contentId);
          break;
        case 'comment':
          await platform.comment(contentId, comment);
          break;
        case 'follow':
          await platform.follow(contentId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      return { platformId, action, contentId, success: true };
    } catch (error) {
      return rejectWithValue({ platformId, error: error.message });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // Engagement action state
  isEngaging: false,
  lastEngagementResults: null,
  engagementError: null,

  // Optimistic UI state — instantly reflect actions before confirmation
  likedPosts: {},      // { [postId]: [platformId, ...] }
  commentedPosts: {},  // { [postId]: { [platformId]: commentText } }
  followedUsers: {},   // { [userId]: [platformId, ...] }

  // Engagement history for analytics
  history: [],         // [{ action, platforms, timestamp, status }]

  // Settings
  defaultComment: '',
  autoFollowOnLike: false,
  engagementSchedule: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

const engagementSlice = createSlice({
  name: 'engagement',
  initialState,

  reducers: {
    // Optimistically mark a post as liked before API confirms
    optimisticLike: (state, action) => {
      const { postId, platformId } = action.payload;
      if (!state.likedPosts[postId]) {
        state.likedPosts[postId] = [];
      }
      if (!state.likedPosts[postId].includes(platformId)) {
        state.likedPosts[postId].push(platformId);
      }
    },

    // Roll back optimistic like if API fails
    rollbackLike: (state, action) => {
      const { postId, platformId } = action.payload;
      if (state.likedPosts[postId]) {
        state.likedPosts[postId] = state.likedPosts[postId].filter(p => p !== platformId);
      }
    },

    // Set default comment text for quick engagement
    setDefaultComment: (state, action) => {
      state.defaultComment = action.payload;
    },

    // Toggle auto-follow on like setting
    setAutoFollowOnLike: (state, action) => {
      state.autoFollowOnLike = action.payload;
    },

    // Clear engagement history
    clearHistory: (state) => {
      state.history = [];
    },

    // Set engagement schedule
    setEngagementSchedule: (state, action) => {
      state.engagementSchedule = action.payload;
    },

    clearError: (state) => {
      state.engagementError = null;
    },
  },

  extraReducers: (builder) => {
    // engageAll
    builder
      .addCase(engageAll.pending, (state) => {
        state.isEngaging = true;
        state.engagementError = null;
      })
      .addCase(engageAll.fulfilled, (state, action) => {
        state.isEngaging = false;
        state.lastEngagementResults = action.payload;

        // Log to history
        state.history.unshift({
          action: action.meta.arg.action,
          platforms: action.payload.map(r => r.platform),
          timestamp: Date.now(),
          results: action.payload,
        });

        // Trim history to last 100 entries
        if (state.history.length > 100) {
          state.history = state.history.slice(0, 100);
        }
      })
      .addCase(engageAll.rejected, (state, action) => {
        state.isEngaging = false;
        state.engagementError = action.payload;
      });

    // engageSingle
    builder
      .addCase(engageSingle.pending, (state) => {
        state.isEngaging = true;
      })
      .addCase(engageSingle.fulfilled, (state, action) => {
        state.isEngaging = false;
        const { platformId, action: engAction, contentId } = action.payload;

        if (engAction === 'like') {
          if (!state.likedPosts[contentId]) state.likedPosts[contentId] = [];
          if (!state.likedPosts[contentId].includes(platformId)) {
            state.likedPosts[contentId].push(platformId);
          }
        }

        if (engAction === 'follow') {
          if (!state.followedUsers[contentId]) state.followedUsers[contentId] = [];
          if (!state.followedUsers[contentId].includes(platformId)) {
            state.followedUsers[contentId].push(platformId);
          }
        }
      })
      .addCase(engageSingle.rejected, (state, action) => {
        state.isEngaging = false;
        state.engagementError = action.payload?.error;
      });
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

export const selectIsEngaging = state => state.engagement.isEngaging;
export const selectLastResults = state => state.engagement.lastEngagementResults;
export const selectEngagementError = state => state.engagement.engagementError;
export const selectLikedPosts = state => state.engagement.likedPosts;
export const selectFollowedUsers = state => state.engagement.followedUsers;
export const selectEngagementHistory = state => state.engagement.history;
export const selectDefaultComment = state => state.engagement.defaultComment;
export const selectAutoFollowOnLike = state => state.engagement.autoFollowOnLike;

export const selectIsPostLiked = (state, postId, platformId) =>
  state.engagement.likedPosts[postId]?.includes(platformId) ?? false;

export const selectIsUserFollowed = (state, userId, platformId) =>
  state.engagement.followedUsers[userId]?.includes(platformId) ?? false;

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const {
  optimisticLike,
  rollbackLike,
  setDefaultComment,
  setAutoFollowOnLike,
  clearHistory,
  setEngagementSchedule,
  clearError,
} = engagementSlice.actions;

export default engagementSlice.reducer;
