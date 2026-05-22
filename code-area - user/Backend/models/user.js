const mongoose = require('mongoose');

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

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    img: { type: String, default: "" },
    code: [
        {
            language: { type: String, default: "" },
            sourceCode: { type: String, default: "" }
        }
    ],
    submissionList: {
        type: [submissionSchema],
        default: []
    },
    solvedTimeLine: {
        type: Map,
        of: Number,
        default: {}
    },
    contestHistory: {
        type: [
            {
                contestName: String,
                rank: Number,
                score: Number,
                date: Date,
                newRating: Number
            }
        ],
        default:[]
    },
    currentRating: {
        type: Number,
        default: -1
    },
    maxRating:{
        type:Number,
        default:-1
    }
});

module.exports = mongoose.model('User', userSchema);
