const CertificateService = require('../services/certificateService');
const EmailService = require('../services/emailService');
const config = require('../config/config');
const fs = require('fs');

class CertificateController {
  /**
   * Generate and send certificates
   */
  async generateAndSend(req, res) {
    try {
      const { participants, programCode, instituteId } = req.body;

      // Validation
      if (!participants || !Array.isArray(participants) || participants.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Participants array is required'
        });
      }

      if (!programCode || !config.PROGRAMS[programCode]) {
        return res.status(400).json({
          success: false,
          error: 'Valid program code is required'
        });
      }

      if (!instituteId) {
        return res.status(400).json({
          success: false,
          error: 'Institute ID is required'
        });
      }

      // Check SMTP configuration
      if (!config.SMTP.USER || !config.SMTP.PASS) {
        return res.status(500).json({
          success: false,
          error: 'SMTP credentials not configured'
        });
      }

      console.log(`\n📜 Starting certificate generation...`);
      console.log(`Program: ${config.PROGRAMS[programCode]}`);
      console.log(`Participants: ${participants.length}\n`);

      // Generate and send
      const results = await CertificateService.generateAndSend({
        participants,
        programCode,
        instituteId,
        issuedBy: "698f1ca2b5fb13c1af0addf7"

      });

      console.log(`\n✅ Successful: ${results.success.length}`);
      console.log(`❌ Failed: ${results.failed.length}\n`);

      res.json({
        success: true,
        message: 'Certificate generation completed',
        results: {
          total: results.total,
          successful: results.success.length,
          failed: results.failed.length,
          details: results
        }
      });

    } catch (error) {
      console.error('Certificate generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate certificates',
        details: error.message
      });
    }
  }

  /**
   * Get all certificates
   */
  async getAll(req, res) {
    try {
      const filters = {
        programCode: req.query.programCode,
        instituteId: req.query.instituteId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const certificates = await CertificateService.getAllCertificates(filters);

      console.log(certificates)
      res.json({
        success: true,
        count: certificates.length,
        certificates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch certificates'
      });
    }
  }

  /**
   * Get certificate by serial number
   */
  async getBySerial(req, res) {
    try {
      const { serialNumber } = req.params;
      const certificate =await CertificateService.getCertificateBySerial(serialNumber);
      console.log(certificate)
      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: 'Certificate not found'
        });
      }

      res.json({
        success: true,
        certificate
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch certificate'
      });
    }
  }

  /**
   * Download certificate
   */
  async download(req, res) {
    try {
      const { serialNumber } = req.params;
      const certificate = CertificateService.getCertificateBySerial(serialNumber);

      if (!certificate) {
        return res.status(404).json({
          success: false,
          error: 'Certificate not found'
        });
      }

      const filePath = CertificateService.getCertificateFilePath(certificate.certificateFile);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'Certificate file not found'
        });
      }

      res.download(filePath);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to download certificate'
      });
    }
  }

  /**
   * Get available programs
   */
  async getPrograms(req, res) {
    try {
      const programs = Object.entries(config.PROGRAMS).map(([code, name]) => ({
        code,
        name
      }));

      res.json({
        success: true,
        programs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch programs'
      });
    }
  }

  /**
   * Test SMTP connection
   */
  async testSMTP(req, res) {
    try {
      if (!config.SMTP.USER || !config.SMTP.PASS) {
        return res.status(500).json({
          success: false,
          message: 'SMTP credentials not configured in .env file'
        });
      }

      await EmailService.verify();

      res.json({
        success: true,
        message: 'SMTP connection successful',
        config: {
          host: config.SMTP.HOST,
          port: config.SMTP.PORT,
          user: config.SMTP.USER
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'SMTP connection failed',
        error: error.message
      });
    }
  }
}

module.exports = new CertificateController();
