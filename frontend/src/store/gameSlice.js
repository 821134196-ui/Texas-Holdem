import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tablesAPI } from '../services/api';

const initialState = {
  tables: [],
  currentTable: null,
  gameState: null,
  privateCards: [],
  chatMessages: [],
  handResult: null,
  loading: false,
  error: null
};

export const fetchTables = createAsyncThunk(
  'game/fetchTables',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tablesAPI.list();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tables');
    }
  }
);

export const createTable = createAsyncThunk(
  'game/createTable',
  async (tableData, { rejectWithValue }) => {
    try {
      const response = await tablesAPI.create(tableData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create table');
    }
  }
);

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentTable: (state, action) => {
      state.currentTable = action.payload;
    },
    setGameState: (state, action) => {
      state.gameState = action.payload;
    },
    setPrivateCards: (state, action) => {
      state.privateCards = action.payload;
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    setHandResult: (state, action) => {
      state.handResult = action.payload;
    },
    clearGameState: (state) => {
      state.currentTable = null;
      state.gameState = null;
      state.privateCards = [];
      state.chatMessages = [];
      state.handResult = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createTable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTable.fulfilled, (state, action) => {
        state.loading = false;
        state.tables.unshift(action.payload);
      })
      .addCase(createTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setCurrentTable,
  setGameState,
  setPrivateCards,
  addChatMessage,
  setHandResult,
  clearGameState,
  clearError
} = gameSlice.actions;

export default gameSlice.reducer;
