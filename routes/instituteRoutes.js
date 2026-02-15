const express = require('express');
const router = express.Router();
const instituteController = require('../controllers/instituteController');
const { protect, authorize } = require('../middleware/auth');

/**
 * All routes require authentication
 */
router.use(protect);

/**
 * @route   GET /api/institutes
 * @desc    Get all institutes
 * @access  Private
 */
router.get('/', instituteController.getAll);

/**
 * @route   GET /api/institutes/:id
 * @desc    Get institute by ID
 * @access  Private
 */
router.get('/:id', instituteController.getById);

/**
 * @route   POST /api/institutes
 * @desc    Create new institute
 * @access  Private (Admin only)
 */
router.post('/', authorize('admin'), instituteController.create);

/**
 * @route   PUT /api/institutes/:id
 * @desc    Update institute
 * @access  Private (Admin only)
 */
router.put('/:id', authorize('admin'), instituteController.update);

/**
 * @route   DELETE /api/institutes/:id
 * @desc    Delete institute
 * @access  Private (Admin only)
 */
router.delete('/:id', authorize('admin'), instituteController.delete);

module.exports = router;
