const express = require('express');
const Paper = require('../models/Paper');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Admin authentication middleware
const adminMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(403).json({ message: 'Access Denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admins only' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid Token' });
  }
};

// Create Paper (Admin only)
router.post('/admin/papers', adminMiddleware, async (req, res) => {
  const { title, unitCode, file } = req.body;
  try {
    const newPaper = new Paper({ title, unitCode, file });
    await newPaper.save();
    res.status(201).json({ message: 'Paper uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit Paper (Admin only)
router.put('/admin/papers/:id', adminMiddleware, async (req, res) => {
  const { title, unitCode, file } = req.body;
  try {
    const updatedPaper = await Paper.findByIdAndUpdate(req.params.id, { title, unitCode, file }, { new: true });
    res.status(200).json(updatedPaper);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Paper (Admin only)
router.delete('/admin/papers/:id', adminMiddleware, async (req, res) => {
  try {
    await Paper.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Paper deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all papers (Admin)
router.get('/admin/papers', adminMiddleware, async (req, res) => {
  try {
    const papers = await Paper.find();
    res.status(200).json(papers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
