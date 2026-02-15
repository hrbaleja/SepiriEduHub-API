const Institute = require('../models/Institute');

class InstituteController {
  /**
   * Get all institutes
   * GET /api/institutes
   */
  async getAll(req, res) {
    try {
      const institutes = await Institute.find({ isActive: true })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: institutes.length,
        institutes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch institutes'
      });
    }
  }

  /**
   * Get institute by ID
   * GET /api/institutes/:id
   */
  async getById(req, res) {
    try {
      const institute = await Institute.findById(req.params.id)
        .populate('createdBy', 'name email');

      if (!institute) {
        return res.status(404).json({
          success: false,
          error: 'Institute not found'
        });
      }

      res.json({
        success: true,
        institute
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch institute'
      });
    }
  }

  /**
   * Create new institute
   * POST /api/institutes
   */
  async create(req, res) {
    try {
      const { collegeName } = req.body;

      if (!collegeName || !collegeName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'College name is required'
        });
      }

      // Check for duplicate
      const existing = await Institute.findOne({ 
        collegeName: collegeName.trim(),
        isActive: true 
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Institute with this name already exists'
        });
      }

      const institute = await Institute.create({
        collegeName: collegeName.trim(),
        createdBy: req.user.id
      });

      await institute.populate('createdBy', 'name email');

      res.status(201).json({
        success: true,
        institute
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create institute'
      });
    }
  }

  /**
   * Update institute
   * PUT /api/institutes/:id
   */
  async update(req, res) {
    try {
      const { collegeName } = req.body;

      if (!collegeName || !collegeName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'College name is required'
        });
      }

      const institute = await Institute.findById(req.params.id);

      if (!institute) {
        return res.status(404).json({
          success: false,
          error: 'Institute not found'
        });
      }

      // Check for duplicate
      const existing = await Institute.findOne({
        collegeName: collegeName.trim(),
        _id: { $ne: req.params.id },
        isActive: true
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Institute with this name already exists'
        });
      }

      institute.collegeName = collegeName.trim();
      await institute.save();
      await institute.populate('createdBy', 'name email');

      res.json({
        success: true,
        institute
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update institute'
      });
    }
  }

  /**
   * Delete institute (soft delete)
   * DELETE /api/institutes/:id
   */
  async delete(req, res) {
    try {
      const institute = await Institute.findById(req.params.id);

      if (!institute) {
        return res.status(404).json({
          success: false,
          error: 'Institute not found'
        });
      }

      // Soft delete
      institute.isActive = false;
      await institute.save();

      res.json({
        success: true,
        message: 'Institute deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete institute'
      });
    }
  }
}

module.exports = new InstituteController();
