import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { questsAPI } from '../services/api';

const initialState = {
  todayBoard: null,
  loading: false,
  error: null,
  toast: null
};

export const fetchTodayBoard = createAsyncThunk(
  'quest/fetchTodayBoard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await questsAPI.getToday();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch quest board');
    }
  }
);

export const claimCheckin = createAsyncThunk(
  'quest/claimCheckin',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await questsAPI.checkin();
      setTimeout(() => {
        dispatch(fetchTodayBoard());
      }, 100);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to checkin');
    }
  }
);

export const claimQuest = createAsyncThunk(
  'quest/claimQuest',
  async (code, { rejectWithValue, dispatch }) => {
    try {
      const response = await questsAPI.claimQuest(code);
      setTimeout(() => {
        dispatch(fetchTodayBoard());
      }, 100);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to claim quest');
    }
  }
);

const questSlice = createSlice({
  name: 'quest',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearToast: (state) => {
      state.toast = null;
    },
    showToast: (state, action) => {
      state.toast = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.todayBoard = action.payload;
      })
      .addCase(fetchTodayBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(claimCheckin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(claimCheckin.fulfilled, (state, action) => {
        state.loading = false;
        state.toast = {
          type: 'success',
          message: `签到成功！获得 ${action.payload.reward} 筹码`
        };
      })
      .addCase(claimCheckin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.toast = {
          type: 'error',
          message: action.payload
        };
      })
      
      .addCase(claimQuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(claimQuest.fulfilled, (state, action) => {
        state.loading = false;
        state.toast = {
          type: 'success',
          message: `任务完成！获得 ${action.payload.reward} 筹码`
        };
      })
      .addCase(claimQuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.toast = {
          type: 'error',
          message: action.payload
        };
      });
  }
});

export const { clearError, clearToast, showToast } = questSlice.actions;
export default questSlice.reducer;
