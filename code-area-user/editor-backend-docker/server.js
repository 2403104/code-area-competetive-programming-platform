const express = require('express');
const cors = require('cors');
const {execute,getProgress }=require('./judge');
const {executeSingleTestcase} = require('./run');
const app = express();

app.use(cors());
app.use(express.json());
require('dotenv').config(); 

app.post('/judge', execute);
app.post('/run', executeSingleTestcase);
app.get('/submission/progress/:submissionId', getProgress);

const port = process.env.JUDGE_BACKEND_PORT || 5000;
app.listen(port, () => {
    console.log(`Editor Backend is running on port ${port}`);
});