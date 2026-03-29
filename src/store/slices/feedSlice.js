/**
 * The All-in-One App — Feed Redux Slice
 * Cherry Computer Ltd.
 *
 * Manages the unified, real-time aggregated feed from all connected platforms.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PlatformService } from '../../services/platforms/PlatformService';

// ─────────────────────────────────────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────────────────────────────────────

export const fetchUnifiedFeed = createAsyncThunk(
  'feed/fetchUnified',
  async ({ limit = 20, refresh = false } = {}, { getState, rejectWithValue }) => {
    try {
      const posts = await PlatformService.getUnifiedFeed({ limit });
      return { posts, refresh };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPlatformFeed = createAsyncThunk(
  'feed/fetchPlatform',
  async ({ platformId, limit = 20, cursor = null }, { rejectWithValue }) => {
    try {
      const platform = PlatformService.get(platformId);
      const posts = await platform.getFeed({ limit, cursor });
      return { platformId, posts, cursor };
    } catch (error) {
      return rejectWithValue({ platformId, error: error.message });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // Unified feed (all platforms merged)
  unifiedFeed: [],
  unifiedFeedStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  unifiedFeedError: null,
  lastRefreshed: null,

  // Per-platform feeds
  platformFeeds: {
    instagram: { posts: [], status: 'idle', cursor: null },
    twitter: { posts: [], status: 'idle', cursor: null },
    facebook: { posts: [], status: 'idle', cursor: null },
    tiktok: { posts: [], status: 'idle', cursor: null },
    linkedin: { posts: [], status: 'idle', cursor: null },
    youtube: { posts: [], status: 'idle', cursor: null },
  },

  // Active filter
  activePlatformFilter: 'all', // 'all' | platformId
  activeContentTypeFilter: 'all', // 'all' | 'video' | 'image' | 'text'

  // WebSocket connection state
  wsConnected: false,
  wsLastEvent: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

const feedSlice = createSlice({
  name: 'feed',
  initialState,

  reducers: {
    setPlatformFilter: (state, action) => {
      state.activePlatformFilter = action.payload;
    },
    setContentTypeFilter: (state, action) => {
      state.activeContentTypeFilter = action.payload;
    },
    // Real-time: prepend a new post from WebSocket
    prependPost: (state, action) => {
      state.unifiedFeed.unshift(action.payload);
    },
    setWsConnected: (state, action) => {
      state.wsConnected = action.payload;
    },
    wsEventReceived: (state, action) => {
      state.wsLastEvent = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUnifiedFeed.pending, (state) => {
        state.unifiedFeedStatus = 'loading';
      })
      .addCase(fetchUnifiedFeed.fulfilled, (state, action) => {
        state.unifiedFeedStatus = 'succeeded';
        if (action.payload.refresh) {
          state.unifiedFeed = action.payload.posts;
        } else {
          const existingIds = new Set(state.unifiedFeed.map(p => p.id));
          const newPosts = action.payload.posts.filter(p => !existingIds.has(p.id));
          state.unifiedFeed = [...state.unifiedFeed, ...newPosts];
        }
        state.lastRefreshed = Date.now();
        state.unifiedFeedError = null;
      })
      .addCase(fetchUnifiedFeed.rejected, (state, action) => {
        state.unifiedFeedStatus = 'failed';
        state.unifiedFeedError = action.payload;
      });

    builder
      .addCase(fetchPlatformFeed.pending, (state, action) => {
        const { platformId } = action.meta.arg;
        if (state.platformFeeds[platformId]) {
          state.platformFeeds[platformId].status = 'loading';
        }
      })
      .addCase(fetchPlatformFeed.fulfilled, (state, action) => {
        const { platformId, posts, cursor } = action.payload;
        if (state.platformFeeds[platformId]) {
          state.platformFeeds[platformId].posts = posts;
          state.platformFeeds[platformId].cursor = cursor;
          state.platformFeeds[platformId].status = 'succeeded';
        }
      })
      .addCase(fetchPlatformFeed.rejected, (state, action) => {
        const { platformId } = action.payload || {};
        if (platformId && state.platformFeeds[platformId]) {
          state.platformFeeds[platformId].status = 'failed';
        }
      });
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────────────────────────────────────

export const selectUnifiedFeed = state => state.feed.unifiedFeed;
export const selectFeedStatus = state => state.feed.unifiedFeedStatus;
export const selectFeedError = state => state.feed.unifiedFeedError;
export const selectLastRefreshed = state => state.feed.lastRefreshed;
export const selectActivePlatformFilter = state => state.feed.activePlatformFilter;
export const selectActiveContentTypeFilter = state => state.feed.activeContentTypeFilter;
export const selectPlatformFeed = (state, platformId) => state.feed.platformFeeds[platformId];
export const selectWsConnected = state => state.feed.wsConnected;

export const selectFilteredFeed = state => {
  const { unifiedFeed, activePlatformFilter, activeContentTypeFilter } = state.feed;
  let filtered = unifiedFeed;

  if (activePlatformFilter !== 'all') {
    filtered = filtered.filter(p => p.platform === activePlatformFilter);
  }
  if (activeContentTypeFilter !== 'all') {
    filtered = filtered.filter(p => p.contentType === activeContentTypeFilter);
  }

  return filtered;
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const {
  setPlatformFilter,
  setContentTypeFilter,
  prependPost,
  setWsConnected,
  wsEventReceived,
} = feedSlice.actions;

export default feedSlice.reducer;
