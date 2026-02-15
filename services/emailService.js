const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  /**
   * Initialize email transporter
   */
  initTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP.HOST,
        port: config.SMTP.PORT,
        secure: config.SMTP.SECURE,
        auth: {
          user: config.SMTP.USER,
          pass: config.SMTP.PASS
        }
      });
    }
    return this.transporter;
  }

  /**
   * Verify SMTP connection
   */
  async verify() {
    const transporter = this.initTransporter();
    return await transporter.verify();
  }

  /**
   * Generate email template
   */
  generateEmailHTML(data) {
    const {
      participantName,
      programName,
      programCode,
      collegeName,
      serialNumber,
      issueDate
    } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .logo { 
            width: 80px; 
            height: 80px; 
            background: white; 
            color: #667eea; 
            border-radius: 50%; 
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 15px;
          }
          .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; }
          .highlight { color: #667eea; font-weight: bold; }
          .info-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .serial-box {
            background: #fff3cd;
            border: 2px solid #d4af37;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 16px;
            text-align: center;
            margin: 15px 0;
          }
          .footer { 
            background: #f5f5f5; 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SE</div>
            <h1 style="margin: 0;">Congratulations!</h1>
            <p style="margin: 10px 0 0 0;">${config.CERTIFICATE.INSTITUTE_NAME}</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${participantName}</strong>,</p>
            
            <p>We are delighted to present you with your <span class="highlight">Certificate of Participation</span> for successfully completing the <strong>${programName} (${programCode})</strong> program.</p>
            
            <div class="info-box">
              <p style="margin: 0; font-size: 14px;"><strong>📋 Certificate Details:</strong></p>
              <div class="serial-box">
                <strong>Certificate Serial Number</strong><br>
                ${serialNumber}
              </div>
              <p style="margin: 5px 0; font-size: 13px;">
                <strong>Program:</strong> ${programName} (${programCode})<br>
                <strong>Conducted at:</strong> ${collegeName}<br>
                <strong>In collaboration with:</strong> ${config.CERTIFICATE.INSTITUTE_NAME}<br>
                <strong>Issue Date:</strong> ${issueDate}
              </p>
            </div>
            
            <p>Your personalized certificate is attached to this email as a PDF file.</p>
            
            <p><strong>Important:</strong> You can verify your certificate authenticity using the serial number provided above.</p>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <strong>Best regards,</strong><br>
              ${config.CERTIFICATE.INSTITUTE_NAME} Team<br>
              <em>${config.CERTIFICATE.TAGLINE}</em>
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${config.CERTIFICATE.INSTITUTE_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send certificate email
   */
  async sendCertificate(data, pdfPath) {
    const transporter = this.initTransporter();
    const emailHTML = this.generateEmailHTML(data);
    
    const mailOptions = {
      from: `"${config.CERTIFICATE.INSTITUTE_NAME}" <${config.SMTP.USER}>`,
      to: data.participantEmail,
      subject: `Certificate of Participation - ${data.programName} [${data.serialNumber}]`,
      html: emailHTML,
      attachments: [{
        filename: data.filename,
        path: pdfPath
      }]
    };

    return await transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
