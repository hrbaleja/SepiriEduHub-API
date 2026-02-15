const { v4: uuidv4 } = require('uuid');

class SerialNumberGenerator {
  /**
   * Generate unique certificate serial number
   * Format: SE-[PROGRAM]-YYYYMM-XXXXXXXX
   * @param {string} programCode - Program code (MCX, BSE, etc.)
   * @returns {string} Serial number
   */
  static generate(programCode) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const uniqueId = uuidv4().split('-')[0].toUpperCase();
    
    return `SE-${programCode}-${year}${month}-${uniqueId}`;
  }

  /**
   * Validate serial number format
   * @param {string} serialNumber 
   * @returns {boolean}
   */
  static validate(serialNumber) {
    const pattern = /^SE-[A-Z]{2,5}-\d{6}-[A-F0-9]{8}$/;
    return pattern.test(serialNumber);
  }

  /**
   * Parse serial number to get components
   * @param {string} serialNumber 
   * @returns {object|null}
   */
  static parse(serialNumber) {
    if (!this.validate(serialNumber)) return null;
    
    const parts = serialNumber.split('-');
    return {
      prefix: parts[0],
      programCode: parts[1],
      yearMonth: parts[2],
      uniqueId: parts[3]
    };
  }
}

module.exports = SerialNumberGenerator;
