/**
 * Standardized API Response structure for all controller handlers.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {any} data - Response payload data
   * @param {string} [message="Success"] - Response message
   * @param {object} [meta=null] - Optional pagination or meta info
   */
  constructor(statusCode, data = null, message = 'Success', meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  /**
   * Send JSON response using Express response object
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json(this);
  }
}

export default ApiResponse;
