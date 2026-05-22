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
const verdictSchema = new mongoose.Schema({
  Input: { type: String },
  Output: { type: String },
  Expected: { type: String },
  Verdict: { type: String },
  checkerLogs: { type: String, required: true },
  time: { type: Number }
});
const submissionSchema = new mongoose.Schema({
  problemId: { type: String, required: true },
  code: [
    {
      language: { type: String, default: "" },
      sourceCode: { type: String, default: "" }
    }
  ],
  status: { type: String, default: "" },
  time: { type: Number, default: 0 },
  errType: { type: String, default: "" },
  errMessage: { type: String, default: "" },
  verdicts: [verdictSchema],
  submissionTime: { type: Date, default: Date.now }
});
const contestSchema = new mongoose.Schema({
  contestName: { type: String, required: true },
  startDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  registeredCandidateCnt: { type: Number, default: 0 },
  registeredCandidate: {
    type: [
      {
        username: { type: String, required: true },
        registeredAt: { type: Date, default: Date.now() }
      }
    ],
    default: []
  },
  problems: { type: [problemSchema], default: [] },
  submissions: {
    type: [
      {
        username: { type: String, required: true },
        mySubmissions: {
          type: [submissionSchema],
          default: []
        }
      }
    ],
    default: []
  },
  finalStanding: {
    type: [
      {
        username: { type: String, required: true },
        score: { type: [Number], required: true },
        penalty: { type: Number, required: true },
        totalScore: { type: Number, required: true },
        correctCnt: { type: Number, required: true }
      }
    ],
    default: []
  },
  announcements: {
    type: [
      {
        text: { type: String, required: true },
        announcedAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  }

})

module.exports = mongoose.model('Contest', contestSchema);