
import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_SENSORS_STATE } from '../../constants/sensorSchema';

/**
 * Academic Context: Redux Toolkit Slice
 * Leverages Immer internally for clean immutable updates, targeting specific keys
 * directly for O(1) complexity.
 */
const sensorSlice = createSlice({
  name: 'sensors',
  initialState: {
    data: INITIAL_SENSORS_STATE,
  },
  reducers: {
    /**
     * Updates a single sensor's metrics using direct dictionary lookups.
     * @param {Object} state - The current mutable draft state managed by Immer
     * @param {Object} action - Contains payload: { id, updatedData }
     */
    updateSensor: (state, action) => {
      const { id, updatedData } = action.payload;
      if (state.data[id]) {
        Object.assign(state.data[id], updatedData);
      }
    },
    
    /**
     * Resets the red-engine state to baseline.
     */
    resetStore: (state) => {
      state.data = INITIAL_SENSORS_STATE;
    },
  },
});

export const { updateSensor, resetStore } = sensorSlice.actions;
export default sensorSlice.reducer;
