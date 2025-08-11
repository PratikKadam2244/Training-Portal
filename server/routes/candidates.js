const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const otpService = require('../services/otpService');

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid 10-digit mobile number is required' 
      });
    }

    const result = await otpService.sendOTP(mobile);
    res.json(result);
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    
    if (!mobile || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number and OTP are required' 
      });
    }

    const result = await otpService.verifyOTP(mobile, otp);
    res.json(result);
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Check if candidate exists
router.post('/check-record', async (req, res) => {
  try {
    const { aadharNumber, mobile } = req.body;
    
    const candidate = await Candidate.findOne({
      $or: [
        { aadharNumber },
        { mobile }
      ]
    });

    if (candidate) {
      res.json({
        success: true,
        exists: true,
        message: 'Candidate already exists',
        candidate: {
          candidateId: candidate.candidateId,
          name: candidate.name,
          status: candidate.status
        }
      });
    } else {
      res.json({
        success: true,
        exists: false,
        message: 'New candidate - proceed to registration'
      });
    }
  } catch (error) {
    console.error('Check record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Register new candidate
router.post('/register', async (req, res) => {
  try {
    const candidateData = req.body;
    
    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({
      $or: [
        { aadharNumber: candidateData.aadharNumber },
        { mobile: candidateData.mobile }
      ]
    });

    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with this Aadhar or mobile number already exists'
      });
    }

    // Create new candidate
    const candidate = new Candidate(candidateData);
    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Candidate registered successfully',
      candidate: {
        candidateId: candidate.candidateId,
        name: candidate.name,
        status: candidate.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Candidate with this information already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }
});

// Search candidate
router.get('/search', async (req, res) => {
  try {
    const { aadhar, mobile, candidateId } = req.query;
    
    let query = {};
    if (aadhar) query.aadharNumber = aadhar;
    if (mobile) query.mobile = mobile;
    if (candidateId) query.candidateId = candidateId;

    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search parameter is required'
      });
    }

    const candidate = await Candidate.findOne(query);
    
    if (candidate) {
      res.json({
        success: true,
        candidate
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
});

// Get all candidates (for admin)
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const candidates = await Candidate.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Candidate.countDocuments(query);

    res.json({
      success: true,
      candidates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates'
    });
  }
});

// Update candidate status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { 
        status,
        ...(status === 'Completed' && { completionDate: new Date() })
      },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      candidate
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
});

module.exports = router;