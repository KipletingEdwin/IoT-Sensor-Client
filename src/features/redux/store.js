
import { configureStore } from '@reduxjs/toolkit';
import sensorReducer from './sensorSlice';

/**
 * Academic Context: Optimized Redux Configuration
 * Disables default serializability and immutability middleware checks.
 * This eliminates significant internal overhead, allowing fair comparison under 
 * high-frequency streaming (e.g., 10ms intervals).
 */
export const store = configureStore({
  reducer: {
    sensors: sensorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});
