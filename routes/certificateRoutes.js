const express = require('express');
const router = express.Router();
const CertificateController = require('../controllers/certificateController');

/**
 * @route   POST /api/certificates/generate
 * @desc    Generate and send certificates
 * @access  Public
 */
router.post('/generate', CertificateController.generateAndSend);

/**
 * @route   GET /api/certificates
 * @desc    Get all certificates (with optional filters)
 * @access  Public
 */
router.get('/', CertificateController.getAll);

/**
 * @route   GET /api/certificates/:serialNumber
 * @desc    Get certificate by serial number
 * @access  Public
 */
router.get('/:serialNumber', CertificateController.getBySerial);

/**
 * @route   GET /api/certificates/:serialNumber/download
 * @desc    Download certificate PDF
 * @access  Public
 */
router.get('/:serialNumber/download', CertificateController.download);

/**
 * @route   GET /api/certificates/programs/list
 * @desc    Get available programs
 * @access  Public
 */
router.get('/programs/list', CertificateController.getPrograms);

/**
 * @route   GET /api/certificates/smtp/test
 * @desc    Test SMTP connection
 * @access  Public
 */
router.get('/smtp/test', CertificateController.testSMTP);

module.exports = router;
