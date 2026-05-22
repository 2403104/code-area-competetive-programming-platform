const express = require('express');
const cors = require('cors');
const connectToMongo = require('./db/dbConnect');
const problemRouter = require('./routes/problemRoutes');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRoute');
const userContestController = require('./routes/userContestRouter');
const discussionRouter = require('./routes/discussionRouter');
require('dotenv').config();

const app = express();
connectToMongo();
app.use(cors());
app.use(express.json());

app.use('/problems', problemRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter, userContestController);
app.use('/discussions', discussionRouter);

const port = process.env.BACKEND_PORT || 5000;
app.listen(port, () => {
    console.log("Backend running on port " + port);
});
