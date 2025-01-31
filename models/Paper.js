const mongoose = require('mongoose');

const pastPaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  unitCode: { type: String, required: true },
  year: { type: Number, required: true },
  file: { type: String, required: true }, // Stores the file path
});

module.exports = mongoose.model('PastPaper', pastPaperSchema);
