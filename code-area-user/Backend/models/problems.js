const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  QNo: { type: Number, default: 0 },
  title: String,
  description: String,
  difficulty: String,
  inputFormat: String,
  outputFormat: String,
  timeLimit: Number,
  memoryLimit: Number,
  score: { type: Number, default: 100 },
  Accepted: { type: Number, default: 0 },
  Submitted: { type: Number, default: 0 },
  constraints: [String],
  topics: [String],
  checkerCode: { type: String, required: true },
  sampleTestCases: [
    {
      input: String,
      output: String,
      explaination: String
    }
  ],
  testcases: [
    {
      input: String,
      expected: String
    }
  ]
});

module.exports = mongoose.model('Problem', problemSchema);
