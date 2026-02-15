const config = require('../config/config');

class CertificateTemplate {
  /**
   * Generate HTML certificate
   * @param {object} data - Certificate data
   * @returns {string} HTML content
   */
  static generate(data) {
    const {
      participantName,
      programCode,
      programFullName,
      collegeName,
      serialNumber,
      issueDate
    } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate - ${participantName}</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  <div class="certificate">
    ${this.getDecorativeElements()}
    ${this.getBorders()}
    ${this.getWatermark()}
    
    <div class="content">
      ${this.getLogo()}
      ${this.getHeader()}
      ${this.getTitle()}
      ${this.getBody(participantName, programCode, programFullName, collegeName)}
      ${this.getFooter(issueDate, serialNumber)}
    </div>
  </div>
</body>
</html>`;
  }

  static getStyles() {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Georgia', serif; background: #fff; }
      
      .certificate {
        width: ${config.CERTIFICATE.WIDTH}px;
        height: ${config.CERTIFICATE.HEIGHT}px;
        position: relative;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 60px;
        overflow: hidden;
      }
      
      .corner {
        position: absolute;
        width: 200px;
        height: 200px;
        border: 3px solid #d4af37;
      }
      
      .corner-tl { top: 40px; left: 40px; border-right: none; border-bottom: none; }
      .corner-tr { top: 40px; right: 40px; border-left: none; border-bottom: none; }
      .corner-bl { bottom: 40px; left: 40px; border-right: none; border-top: none; }
      .corner-br { bottom: 40px; right: 40px; border-left: none; border-top: none; }
      
      .border-outer {
        position: absolute;
        top: 30px; left: 30px; right: 30px; bottom: 30px;
        border: 8px solid #1a237e;
        border-radius: 20px;
      }
      
      .border-inner {
        position: absolute;
        top: 50px; left: 50px; right: 50px; bottom: 50px;
        border: 3px solid #d4af37;
        border-radius: 15px;
        background: white;
        box-shadow: inset 0 0 30px rgba(0,0,0,0.05);
      }
      
      .content {
        position: absolute;
        top: 80px; left: 80px; right: 80px; bottom: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      
      .logo {
        width: 150px;
        height: 150px;
        margin-bottom: 25px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        font-weight: bold;
        color: white;
        border: 5px solid #d4af37;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      
      .sepiri-brand {
        font-size: 40px;
        font-weight: bold;
        color: #1a237e;
        margin-bottom: 8px;
        letter-spacing: 3px;
        text-transform: uppercase;
      }
      
      .sepiri-tagline {
        font-size: 20px;
        color: #666;
        margin-bottom: 30px;
        font-style: italic;
      }
      
      .title {
        font-size: 72px;
        font-weight: bold;
        color: #1a237e;
        margin-bottom: 10px;
        letter-spacing: 5px;
        text-transform: uppercase;
      }
      
      .cert-type {
        font-size: 36px;
        color: #d4af37;
        margin-bottom: 40px;
        font-style: italic;
      }
      
      .decorative-line {
        width: 400px;
        height: 3px;
        background: linear-gradient(90deg, transparent, #d4af37, transparent);
        margin: 20px 0;
      }
      
      .text-presented {
        font-size: 26px;
        color: #333;
        margin-bottom: 25px;
      }
      
      .participant-name {
        font-size: 58px;
        font-weight: bold;
        color: #1a237e;
        margin: 25px 0;
        padding: 18px 45px;
        border-bottom: 3px solid #d4af37;
        display: inline-block;
        text-transform: capitalize;
      }
      
      .text-content {
        font-size: 24px;
        color: #444;
        margin: 18px 0;
        line-height: 1.6;
      }
      
      .program-name {
        font-size: 36px;
        font-weight: bold;
        color: #667eea;
        margin: 22px 0;
      }
      
      .college-section {
        margin-top: 25px;
        padding: 25px 40px;
        background: rgba(102, 126, 234, 0.08);
        border-radius: 10px;
        border-left: 5px solid #667eea;
        min-width: 600px;
      }
      
      .conducted-text {
        font-size: 22px;
        color: #666;
        margin-bottom: 12px;
      }
      
      .college-name {
        font-size: 34px;
        font-weight: bold;
        color: #1a237e;
        margin: 12px 0;
      }
      
      .collaboration-text {
        font-size: 20px;
        color: #888;
        margin: 15px 0 8px 0;
      }
      
      .sepiri-footer {
        font-size: 28px;
        font-weight: bold;
        color: #667eea;
        margin-top: 8px;
      }
      
      .footer {
        position: absolute;
        bottom: 90px;
        left: 100px;
        right: 100px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      
      .footer-item { text-align: center; }
      
      .footer-label {
        font-size: 18px;
        color: #666;
        margin-bottom: 5px;
      }
      
      .footer-value {
        font-size: 22px;
        font-weight: bold;
        color: #1a237e;
      }
      
      .serial-number {
        font-family: 'Courier New', monospace;
        background: #fff3cd;
        padding: 8px 15px;
        border: 2px solid #d4af37;
        border-radius: 5px;
      }
      
      .signature-line {
        width: 200px;
        border-top: 2px solid #333;
        padding-top: 10px;
      }
      
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 120px;
        color: rgba(26, 35, 126, 0.03);
        font-weight: bold;
        letter-spacing: 20px;
        pointer-events: none;
        z-index: 0;
      }
    `;
  }

  static getDecorativeElements() {
    return `
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
    `;
  }

  static getBorders() {
    return `
      <div class="border-outer"></div>
      <div class="border-inner"></div>
    `;
  }

  static getWatermark() {
    return `<div class="watermark">SEPIRI EDUHUB</div>`;
  }

  static getLogo() {
    return `<div class="logo">SE</div>`;
  }

  static getHeader() {
    return `
      <div class="sepiri-brand">${config.CERTIFICATE.INSTITUTE_NAME}</div>
      <div class="sepiri-tagline">${config.CERTIFICATE.TAGLINE}</div>
      <div class="decorative-line"></div>
    `;
  }

  static getTitle() {
    return `
      <div class="title">Certificate</div>
      <div class="cert-type">of Participation</div>
    `;
  }

  static getBody(participantName, programCode, programFullName, collegeName) {
    return `
      <div class="text-presented">This is to certify that</div>
      <div class="participant-name">${participantName}</div>
      <div class="text-content">has successfully participated in and completed the</div>
      <div class="program-name">${programFullName} (${programCode})</div>
      
      <div class="college-section">
        <div class="conducted-text">Program conducted at</div>
        <div class="college-name">${collegeName}</div>
        <div class="collaboration-text">in collaboration with</div>
        <div class="sepiri-footer">${config.CERTIFICATE.INSTITUTE_NAME}</div>
      </div>
    `;
  }

  static getFooter(issueDate, serialNumber) {
    return `
      <div class="footer-item">
        <div class="footer-label">Issue Date</div>
        <div class="footer-value">${issueDate}</div>
      </div>
      
      <div class="footer-item">
        <div class="signature-line">
          <div class="footer-label">Authorized Signature</div>
        </div>
      </div>
      
      <div class="footer-item">
        <div class="footer-label">Certificate No.</div>
        <div class="footer-value serial-number">${serialNumber}</div>
      </div>
    `;
  }
}

module.exports = CertificateTemplate;
