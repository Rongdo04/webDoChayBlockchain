// services/reportsAPI.js
import httpClient, { httpUtils } from "./httpClient";
import { API_ENDPOINTS } from "../config";

/**
 * Reports API service for handling report submissions
 */
class ReportsAPI {
  constructor() {
    this.baseEndpoint = API_ENDPOINTS.REPORTS || "/api/reports";
  }

  /**
   * Submit a report
   * @param {Object} reportData - The report data
   * @param {string} reportData.targetType - Type of target ('recipe' | 'comment' | 'post')
   * @param {string} reportData.targetId - ID of the target being reported
   * @param {string} reportData.reason - Reason for the report
   * @param {string} [reportData.description] - Additional description (optional)
   * @returns {Promise<Object>} API response
   */
  async submitReport(reportData) {
    try {
      const response = await httpClient.post(this.baseEndpoint, reportData);
      return response;
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  }

  /**
   * Get user's reports (if needed for user dashboard)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async getUserReports(params = {}) {
    try {
      const queryString = httpUtils.buildQueryString(params);
      const url = queryString
        ? `${this.baseEndpoint}/user?${queryString}`
        : `${this.baseEndpoint}/user`;
      return await httpClient.get(url);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  }
}

// Create and export singleton instance
const reportsAPI = new ReportsAPI();
export default reportsAPI;
