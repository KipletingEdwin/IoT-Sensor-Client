
import { create } from 'zustand';
import { INITIAL_SENSORS_STATE } from '../../constants/sensorSchema';

/**
 * Academic Context: Zustand State Store
 * Uses a shallow merge strategy for granular, localized updates. 
 * Minimises garbage collection overhead during high-frequency real-time updates.
 */
export const useSensorStore = create((set) => ({
  // Seed the store with initial baseline states
  sensors: INITIAL_SENSORS_STATE,

  /**
   * Updates a single sensor's metrics with zero side-effects.
   * Optimized for O(1) dictionary lookups to avoid iterating over arrays.
   * @param {string} id - The specific sensor ID (e.g., 'TEMP_01')
   * @param {Object} updatedData - Object containing new value, status, or lastUpdated timestamp
   */
  updateSensor: (id, updatedData) =>
    set((state) => ({
      sensors: {
        ...state.sensors,
        [id]: {
          ...state.sensors[id],
          ...updatedData,
        },
      },
    })),

  /**
   * Resets all sensors to baseline offline values.
   * Used between benchmarking runs to clear volatile state history.
   */
  resetStore: () => set({ sensors: INITIAL_SENSORS_STATE }),
}));
