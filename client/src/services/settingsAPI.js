// services/settingsAPI.js
import httpClient from "./httpClient";

/**
 * Settings API service for managing site settings
 */
class SettingsAPI {
  constructor() {
    this.baseEndpoint = "/settings";
  }

  /**
   * Get current site settings
   * @returns {Promise<Object>} Settings data
   */
  async getSettings() {
    try {
      const response = await httpClient.get(this.baseEndpoint);
      return response;
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      throw error;
    }
  }

  /**
   * Get public settings (for non-admin users)
   * @returns {Promise<Object>} Public settings data
   */
  async getPublicSettings() {
    try {
      const response = await httpClient.get(`${this.baseEndpoint}/public`);
      return response;
    } catch (error) {
      console.error("Failed to fetch public settings:", error);
      throw error;
    }
  }
}

// Create and export instance
const settingsAPI = new SettingsAPI();
export default settingsAPI;

// Export class for testing
export { SettingsAPI };
