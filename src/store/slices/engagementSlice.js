/**
 * The All-in-One App — Engagement Redux Slice
 * Cherry Computer Ltd.
 *
 * State management for the one-tap engagement engine.
 * Tracks engagement status, results, and history.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

// ─── Thunks ───────────────────────────────────────────────────────────────

export const engageAll = createAsyncThunk(
  'engagement/engageAll',
  async ({ contentMap, action, comment }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth?.accessToken;
      const response = await axios.post(
        `${API_BASE}/engagement/fire`,
        { contentMap, action, commentText: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.results;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Engagement failed');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────

const engagementSlice = createSlice({
  name: 'engagement',
  initialState: {
    isEngaging:  false,
    lastResults: null,
    history:     [],
    error:       null,
  },
  reducers: {
    clearLastResults: (state) => { state.lastResults = null; },
    clearError:       (state) => { state.error = null; },
    clearHistory:     (state) => { state.history = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(engageAll.pending, (state) => {
        state.isEngaging = true;
        state.error      = null;
      })
      .addCase(engageAll.fulfilled, (state, action) => {
        state.isEngaging  = false;
        state.lastResults = action.payload;
        // Prepend to history (cap at 50)
        state.history = [
          {
            action:    action.meta.arg.action,
            results:   action.payload,
            timestamp: new Date().toISOString(),
          },
          ...state.history.slice(0, 49),
        ];
      })
      .addCase(engageAll.rejected, (state, action) => {
        state.isEngaging = false;
        state.error      = action.payload || 'Unknown error';
      });
  },
});

export const { clearLastResults, clearError, clearHistory } = engagementSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────

export const selectIsEngaging        = (state) => state.engagement.isEngaging;
export const selectLastResults       = (state) => state.engagement.lastResults;
export const selectEngagementHistory = (state) => state.engagement.history;
export const selectEngagementError   = (state) => state.engagement.error;

export default engagementSlice.reducer;
