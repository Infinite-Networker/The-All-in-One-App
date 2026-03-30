/**
 * The All-in-One App — Feed Redux Slice
 * Cherry Computer Ltd.
 *
 * State management for the unified cross-platform feed.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

// ─── Thunks ───────────────────────────────────────────────────────────────

export const fetchUnifiedFeed = createAsyncThunk(
  'feed/fetchUnified',
  async ({ refresh = false, limit = 20, platform = 'all' } = {}, { getState, rejectWithValue }) => {
    try {
      const token    = getState().auth?.accessToken;
      const endpoint = platform === 'all'
        ? `${API_BASE}/feed`
        : `${API_BASE}/feed/${platform}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params:  { limit, refresh },
      });

      return { items: response.data.items, refresh, platform };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch feed');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    items:          [],
    filteredPlatform: 'all',
    status:         'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'
    error:          null,
    lastRefreshed:  null,
  },
  reducers: {
    setFilter: (state, action) => {
      state.filteredPlatform = action.payload;
    },
    markItemLiked: (state, action) => {
      const { platform, id } = action.payload;
      const item = state.items.find((i) => i.platform === platform && i.id === id);
      if (item) {
        item.isLiked  = true;
        item.likeCount = (item.likeCount || 0) + 1;
      }
    },
    clearFeed: (state) => {
      state.items  = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnifiedFeed.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(fetchUnifiedFeed.fulfilled, (state, action) => {
        const { items, refresh } = action.payload;
        state.status        = 'succeeded';
        state.lastRefreshed = new Date().toISOString();

        if (refresh) {
          state.items = items;
        } else {
          // Deduplicate by platform + id
          const existing = new Set(state.items.map((i) => `${i.platform}_${i.id}`));
          const newItems = items.filter((i) => !existing.has(`${i.platform}_${i.id}`));
          state.items = [...state.items, ...newItems];
        }
      })
      .addCase(fetchUnifiedFeed.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload || 'Unknown error';
      });
  },
});

export const { setFilter, markItemLiked, clearFeed } = feedSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────

export const selectFeedStatus    = (state) => state.feed.status;
export const selectFeedError     = (state) => state.feed.error;
export const selectActiveFilter  = (state) => state.feed.filteredPlatform;
export const selectLastRefreshed = (state) => state.feed.lastRefreshed;

export const selectFilteredFeed = (state) => {
  const { items, filteredPlatform } = state.feed;
  if (filteredPlatform === 'all') return items;
  return items.filter((item) => item.platform === filteredPlatform);
};

export default feedSlice.reducer;
