import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import gameReducer from './gameSlice';
import questReducer from './questSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    quest: questReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/getProfile/fulfilled', 'game/fetchTables/fulfilled']
      }
    })
});
