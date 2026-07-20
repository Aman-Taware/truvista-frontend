import api from './index';

/**
 * Tour API Service
 * Handles API calls for the virtual tour feature
 */
const tourApi = {
  // ===============================================================
  // PUBLIC ENDPOINTS
  // ===============================================================
  
  /**
   * Get virtual tour for a property
   * @param {number} propertyId - Property ID
   * @returns {Promise<Object>} Tour data with scenes and hotspots
   */
  getTour: async (propertyId) => {
    try {
      const response = await api.get(`/api/tour/properties/${propertyId}`);
      return response;
    } catch (error) {
      console.error('Error fetching tour:', error);
      throw error;
    }
  },

  /**
   * Check if a property has a virtual tour
   * @param {number} propertyId - Property ID
   * @returns {Promise<boolean>} True if property has a tour
   */
  hasTour: async (propertyId) => {
    try {
      // Avoid cache by appending a small random param handled by the interceptor
      const response = await api.get(`/api/tour/properties/${propertyId}/exists`);
      return response;
    } catch (error) {
      console.error('Error checking tour existence:', error);
      return false; // Safely default to false on error
    }
  },

  // ===============================================================
  // ADMIN ENDPOINTS
  // ===============================================================
  
  /**
   * Add a new scene to a property's tour
   * @param {number} propertyId - Property ID
   * @param {FormData} formData - Must contain 'name', 'displayOrder', and 'panorama' file
   * @returns {Promise<Object>} Created scene
   */
  addScene: async (propertyId, formData) => {
    try {
      const response = await api.post(`/api/admin/tour/properties/${propertyId}/scenes`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error adding scene:', error);
      throw error;
    }
  },

  /**
   * Update a scene
   * @param {number} sceneId - Scene ID
   * @param {Object} data - Update data (name, initialYaw, initialPitch, displayOrder)
   * @returns {Promise<Object>} Updated scene
   */
  updateScene: async (sceneId, data) => {
    try {
      const response = await api.put(`/api/admin/tour/scenes/${sceneId}`, data);
      return response;
    } catch (error) {
      console.error('Error updating scene:', error);
      throw error;
    }
  },

  /**
   * Delete a scene
   * @param {number} sceneId - Scene ID
   * @returns {Promise<void>}
   */
  deleteScene: async (sceneId) => {
    try {
      const response = await api.delete(`/api/admin/tour/scenes/${sceneId}`);
      return response;
    } catch (error) {
      console.error('Error deleting scene:', error);
      throw error;
    }
  },

  /**
   * Add a hotspot to a scene
   * @param {number} sceneId - Scene ID
   * @param {Object} data - Hotspot data (type, yaw, pitch, label, targetSceneId, infoText)
   * @returns {Promise<Object>} Created hotspot
   */
  addHotspot: async (sceneId, data) => {
    try {
      const response = await api.post(`/api/admin/tour/scenes/${sceneId}/hotspots`, data);
      return response;
    } catch (error) {
      console.error('Error adding hotspot:', error);
      throw error;
    }
  },

  /**
   * Update a hotspot
   * @param {number} hotspotId - Hotspot ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated hotspot
   */
  updateHotspot: async (hotspotId, data) => {
    try {
      const response = await api.put(`/api/admin/tour/hotspots/${hotspotId}`, data);
      return response;
    } catch (error) {
      console.error('Error updating hotspot:', error);
      throw error;
    }
  },

  /**
   * Delete a hotspot
   * @param {number} hotspotId - Hotspot ID
   * @returns {Promise<void>}
   */
  deleteHotspot: async (hotspotId) => {
    try {
      const response = await api.delete(`/api/admin/tour/hotspots/${hotspotId}`);
      return response;
    } catch (error) {
      console.error('Error deleting hotspot:', error);
      throw error;
    }
  }
};

export default tourApi;
