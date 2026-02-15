const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  collegeName: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
    minlength: [3, 'College name must be at least 3 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
instituteSchema.index({ collegeName: 1 });
instituteSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Institute', instituteSchema);
