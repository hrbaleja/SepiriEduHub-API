const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  participantName: {
    type: String,
    required: true,
    trim: true
  },
  participantEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  programCode: {
    type: String,
    required: true,
    uppercase: true
  },
  programName: {
    type: String,
    required: true
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true
  },
  collegeName: {
    type: String,
    required: true
  },
  certificateFile: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for faster queries
// certificateSchema.index({ serialNumber: 1 });
certificateSchema.index({ participantEmail: 1 });
certificateSchema.index({ programCode: 1 });
certificateSchema.index({ institute: 1 });
certificateSchema.index({ issuedBy: 1 });
certificateSchema.index({ issueDate: -1 });

// Virtual for days since issued
certificateSchema.virtual('daysSinceIssued').get(function() {
  const now = new Date();
  const issued = new Date(this.issueDate);
  const diffTime = Math.abs(now - issued);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Certificate', certificateSchema);
