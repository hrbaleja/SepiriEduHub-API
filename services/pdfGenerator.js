const puppeteer = require('puppeteer');
const path = require('path');
const config = require('../config/config');

class PDFGenerator {
  /**
   * Generate PDF from HTML
   * @param {string} html - HTML content
   * @param {string} filename - Output filename
   * @returns {Promise<string>} PDF file path
   */
  static async generate(html, filename) {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.setViewport({
        width: config.CERTIFICATE.WIDTH,
        height: config.CERTIFICATE.HEIGHT
      });
      
      const pdfPath = path.join(config.PATHS.CERTIFICATES, filename);
      
      await page.pdf({
        path: pdfPath,
        width: `${config.CERTIFICATE.WIDTH}px`,
        height: `${config.CERTIFICATE.HEIGHT}px`,
        printBackground: true,
        preferCSSPageSize: true
      });
      
      return pdfPath;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = PDFGenerator;
