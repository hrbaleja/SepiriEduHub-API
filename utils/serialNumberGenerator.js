// Fixed version - No ES Module import needed
// Use crypto instead of uuid for Vercel compatibility

const crypto = require('crypto');

class SerialNumberGenerator {
  /**
   * Generate serial number: SE-MCX-202402-ABC12345
   * @param {string} programCode - Program code (e.g., 'MCX', 'BSE')
   * @returns {string} - Generated serial number
   */
  static generate(programCode) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Generate unique ID using crypto (built-in, no external package)
    const uniqueId = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    return `SE-${programCode}-${year}${month}-${uniqueId}`;
  }

  /**
   * Validate serial number format
   * @param {string} serialNumber 
   * @returns {boolean}
   */
  static validate(serialNumber) {
    const pattern = /^SE-[A-Z]{3,5}-\d{6}-[A-F0-9]{8}$/;
    return pattern.test(serialNumber);
  }

  /**
   * Parse serial number
   * @param {string} serialNumber 
   * @returns {object}
   */
  static parse(serialNumber) {
    const parts = serialNumber.split('-');
    if (parts.length !== 4) {
      throw new Error('Invalid serial number format');
    }

    const [prefix, programCode, dateCode, uniqueId] = parts;
    const year = dateCode.substring(0, 4);
    const month = dateCode.substring(4, 6);

    return {
      prefix,
      programCode,
      year: parseInt(year),
      month: parseInt(month),
      uniqueId,
      isValid: this.validate(serialNumber)
    };
  }
}

module.exports = SerialNumberGenerator;