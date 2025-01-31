const express = require('express');
const multer = require('multer');
const Paper = require('../models/Paper');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  },
});

// router.post('/upload', upload.single('paper'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

//     const { title, unitCode, year } = req.body;
//     if (!title || !unitCode || !year) return res.status(400).json({ message: 'Title, Unit Code, and Year are required' });

//     const newPaper = new Paper({ title, unitCode, year, file: req.file.filename });
//     await newPaper.save();

//     res.status(201).json({ message: 'Paper uploaded successfully', paper: newPaper });
//   } catch (err) {
//     res.status(500).json({ message: err.message || 'Server error' });
//   }
// });




router.post('/upload',  upload.single('paper'), async (req, res) => {
  const { title, unitCode, year } = req.body;
  try {
    const newPaper = new Paper({ title, unitCode, year, file: req.file.filename });
    await newPaper.save();
    res.status(201).json({ message: "Paper uploaded successfully", paper: newPaper });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete paper by ID (admin only)
router.delete('/delete/:id',  async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPaper = await Paper.findByIdAndDelete(id);
    if (!deletedPaper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    res.json({ message: "Paper deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Edit paper details (admin only)
router.put('/edit/:id',  async (req, res) => {
  const { id } = req.params;
  const { title, unitCode, year } = req.body;

  try {
    const updatedPaper = await Paper.findByIdAndUpdate(id, { title, unitCode, year }, { new: true });
    if (!updatedPaper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    res.json({ message: "Paper updated successfully", updatedPaper });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// 📌 Get all papers
router.get('/', async (req, res) => {
  try {
    const papers = await Paper.find();
    res.json(papers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// routes/papers.js
router.get('/search', async (req, res) => {
  const { unitCode, title, page = 1, limit = 10 } = req.query;

  try {
    let searchQuery = {};

    if (unitCode) {
      searchQuery.unitCode = { $regex: new RegExp(unitCode, 'i') };
    }

    if (title) {
      searchQuery.title = { $regex: new RegExp(title, 'i') };
    }

    const papers = await Paper.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalPapers = await Paper.countDocuments(searchQuery);

    res.json({
      papers,
      totalPages: Math.ceil(totalPapers / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Search papers by unit code and year
// router.get('/search', async (req, res) => {
//   try {
//     const { unitCode, year } = req.query;

//     if (!unitCode && !year) {
//       return res.status(400).json({ message: "Unit code or year is required" });
//     }

//     let query = {};
//     if (unitCode) {
//       query.unitCode = { $regex: new RegExp(unitCode, "i") };
//     }
//     if (year) {
//       query.year = year;
//     }

//     const papers = await Paper.find(query);

//     if (papers.length === 0) {
//       return res.status(404).json({ message: "No papers found" });
//     }

//     res.json(papers);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });


// 📌 Serve past paper files
router.get('/files/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

  res.sendFile(filePath);
});

module.exports = router;
