const Certificate = require('../models/Certificate');
const Institute = require('../models/Institute');
const SerialNumberGenerator = require('../utils/serialNumberGenerator');
const CertificateTemplate = require('../utils/certificateTemplate');
const PDFGenerator = require('./pdfGenerator');
const EmailService = require('./emailService');
const config = require('../config/config');
const path = require('path');

class CertificateService {
  /**
   * Generate and send certificates
   */
  async generateAndSend(data) {
    const { participants, programCode, instituteId,issuedBy  } = data;

    // Validate program
    if (!config.PROGRAMS[programCode]) {
      throw new Error('Invalid program code');
    }

    // Get institute from MongoDB
    const institute = await Institute.findById(instituteId);
    if (!institute) {
      throw new Error('Institute not found');
    }

    const results = {
      success: [],
      failed: [],
      total: participants.length
    };

    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      const progress = `[${i + 1}/${participants.length}]`;

      try {
        console.log(`${progress} Generating certificate for ${participant.name}...`);

        // Generate serial number
        const serialNumber = SerialNumberGenerator.generate(programCode);

        const certificateData = {
          participantName: participant.name,
          programCode,
          programFullName: config.PROGRAMS[programCode],
          collegeName: institute.collegeName,
          serialNumber,
          issueDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        };

        // Generate HTML
        const html = CertificateTemplate.generate(certificateData);

        // Generate PDF
        const filename = `${participant.name.replace(/\s+/g, '_')}_${serialNumber}.pdf`;
        const pdfPath = await PDFGenerator.generate(html, filename);

        // Save to MongoDB (✅ CORRECT)
        const certificate = await Certificate.create({
          serialNumber,
          participantName: participant.name,
          participantEmail: participant.email,
          programCode,
          programName: config.PROGRAMS[programCode],
          institute: institute._id,
          collegeName: institute.collegeName,
          issueDate: new Date(),
          certificateFile: filename,
                  issuedBy: issuedBy  // ← Add this

        });
        

        // Send email
        await EmailService.sendCertificate(
          {
            ...certificateData,
            participantEmail: participant.email,
            filename
          },
          pdfPath
        );

        results.success.push({
          name: participant.name,
          email: participant.email,
          serialNumber,
          certificateFile: filename
        });

        console.log(`✅ ${progress} Sent to ${participant.name}`);

      } catch (error) {
        console.error(`❌ ${progress} Failed for ${participant.name}:`, error.message);
        results.failed.push({
          name: participant.name,
          email: participant.email,
          error: error.message
        });
      }
    }

    return results;
  }

  // ===============================
  // Queries
  // ===============================

  async getAllCertificates(filters = {}) {
    return await Certificate.find(filters).sort({ createdAt: -1 });
  }

  async getCertificateBySerial(serialNumber) {
    return await Certificate.findOne({ serialNumber });
  }

  getCertificateFilePath(filename) {
    return path.join(config.PATHS.CERTIFICATES, filename);
  }
}

module.exports = new CertificateService();
