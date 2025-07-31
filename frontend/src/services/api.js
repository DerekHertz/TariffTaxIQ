/**
 * API Service for TariffTax IQ Application
 * 
 * This module provides a centralized service for all API communications
 * with the backend FastAPI server. It handles HTTP requests, error handling,
 * and data transformation for tariff-related operations.
 * 
 * Environment Variables:
 * - VITE_API_URL: Backend API base URL (defaults to localhost:8000 for development)
 */

// API base URL with environment variable support for different deployments
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * ApiService class encapsulates all API communication logic
 * 
 * Features:
 * - Consistent error handling across all endpoints
 * - Automatic JSON content-type headers
 * - Centralized request/response processing
 * - Detailed error logging for debugging
 */
class ApiService {
  /**
   * Generic fetch wrapper with enhanced error handling
   * 
   * Provides consistent error handling, automatic JSON parsing,
   * and request/response logging for all API calls.
   * 
   * @param {string} url - The full URL to fetch from  
   * @param {Object} options - Fetch options (method, headers, body, etc.)
   * @returns {Promise<Object>} Parsed JSON response data
   * @throws {Error} HTTP errors or network failures
   * 
   * @example
   * const data = await this.fetchWithError('/api/products', { method: 'GET' });
   */
  async fetchWithError(url, options = {}) {
    try {
      // Make HTTP request with default JSON headers
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers, // Allow header overrides
        },
      });

      // Check for HTTP error status codes
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      // Parse and return JSON response
      return await response.json();
    } catch (error) {
      // Log error details for debugging
      console.error('API Error:', error);
      console.error('Request URL:', url);
      console.error('Request Options:', options);
      
      // Re-throw to allow component-level error handling
      throw error;
    }
  }

  /**
   * Fetch all available products with their tariff and elasticity data
   * 
   * Retrieves the complete list of products from the backend, including
   * HS codes, names, categories, elasticity values, and current/proposed tariff rates.
   * 
   * @returns {Promise<Array>} Array of product objects
   * @throws {Error} Network or server errors
   * 
   * @example
   * const products = await api.getProducts();
   * // Returns: [{ hs_code: '854430', name: 'Wiring Sets', ... }]
   */
  async getProducts() {
    return this.fetchWithError(`${API_URL}/api/products`);
  }

  /**
   * Fetch detailed information for a specific product by HS code
   * 
   * @param {string} hsCode - The Harmonized System code for the product
   * @returns {Promise<Object>} Detailed product information
   * @throws {Error} Product not found (404) or other API errors
   * 
   * @example
   * const product = await api.getProduct('854430');
   * // Returns: { hs_code: '854430', name: 'Wiring Sets', country_of_origin: 'China', ... }
   */
  async getProduct(hsCode) {
    return this.fetchWithError(`${API_URL}/api/products/${hsCode}`);
  }

  /**
   * Calculate tariff impact using backend economic models
   * 
   * Sends user input parameters to the backend for server-side calculation
   * using economic models and returns detailed impact analysis.
   * 
   * @param {Object} data - Calculation parameters
   * @param {number} data.retail_price - Current retail price in dollars
   * @param {number} data.retail_markup - Retailer markup percentage
   * @param {number} data.tariff_rate - Proposed tariff rate percentage
   * @param {number} data.pass_through_rate - Expected pass-through rate percentage
   * @param {number} data.inventory_buffer - Months of inventory buffer
   * @param {string|null} data.hs_code - Product HS code (optional)
   * @returns {Promise<Object>} Calculation results with impact metrics
   * @throws {Error} Invalid parameters or calculation errors
   * 
   * @example
   * const result = await api.calculateTariffImpact({
   *   retail_price: 100,
   *   retail_markup: 50,
   *   tariff_rate: 25,
   *   pass_through_rate: 75,
   *   inventory_buffer: 3,
   *   hs_code: '854430'
   * });
   * // Returns: { import_cost: 66.67, tariff_amount: 16.67, ... }
   */
  async calculateTariffImpact(data) {
    return this.fetchWithError(`${API_URL}/api/calculate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Fetch predefined tariff scenarios for analysis
   * 
   * Retrieves current and proposed tariff rates by sector/category
   * for comparative analysis and scenario planning.
   * 
   * @returns {Promise<Object>} Tariff scenarios by category
   * @throws {Error} Network or server errors
   * 
   * @example
   * const scenarios = await api.getTariffScenarios();
   * // Returns: { current_rates: { Electronics: 2.5, ... }, proposed_changes: { ... } }
   */
  async getTariffScenarios() {
    return this.fetchWithError(`${API_URL}/api/tariff-scenarios`);
  }
}

// Export singleton instance for use throughout the application
export const api = new ApiService();