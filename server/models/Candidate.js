const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  dob: {
    type: Date,
    required: true
  },
  aadharNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{4}-\d{4}-\d{4}$/
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{10}$/
  },
  address: {
    type: String,
    required: true
  },
  
  // Training Information
  program: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Category 1 - Basic Skills', 'Category 2 - Intermediate Skills', 'Category 3 - Advanced Skills', 'Category 4 - Specialized Skills']
  },
  center: {
    type: String,
    required: true
  },
  trainer: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  
  // System Information
  candidateId: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['Enrolled', 'In Progress', 'Completed', 'Dropped'],
    default: 'Enrolled'
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  },
  
  // Timestamps
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate candidate ID before saving
candidateSchema.pre('save', function(next) {
  if (!this.candidateId) {
    this.candidateId = `DB${Date.now().toString().slice(-6)}`;
  }
  next();
});

module.exports = mongoose.model('Candidate', candidateSchema);