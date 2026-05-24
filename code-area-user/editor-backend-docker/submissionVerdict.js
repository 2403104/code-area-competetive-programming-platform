const { executeCode } = require('./executor');

const testcaseProgress = new Map();

const submissionVerdict = async (req, res) => {
    const { code, language, testcases, submissionId } = req.body;

    testcaseProgress.set(submissionId, 0);

    try {
        const verdict = [];
        let time = 0;
        let status = "Accepted";
        let idx = 0;

        for (let testcase of testcases) {
            idx++;
            testcaseProgress.set(submissionId, idx);

            const output = await executeCode(code, language, testcase.input);
            if (output.error) {
                if (output.error === "Time Limit Exceeded") {
                    let err = {
                        Input: testcase.input,
                        Output: "-",
                        Expected: testcase.expected.trim(),
                        Verdict: "Time Limit Exceeded On Testcase " + idx,
                        ErrMessage: output.error,
                        time: output.time
                    };
                    time += output.time;
                    status = "Time Limit Exceeded";
                    verdict.push(err);
                } else {
                    let err = {
                        Verdict: "Compilation Error",
                        ErrMessage: output.error
                    };
                    status = "Compilation Error";
                    verdict.push(err);
                }
                break;
            }
            time += output.time;

            const stats = {
                Input: testcase.input,
                Output: output.output.trim(),
                Expected: testcase.expected.trim(),
                Verdict: output.output.trim() === testcase.expected.trim() ? "ok" : "WRONG ANSWER",
                time: output.time,
            };
            verdict.push(stats);

            if (stats.Verdict === "WRONG ANSWER") {
                status = "Wrong Answer On Testcase " + idx;
                break;
            }
        }

        testcaseProgress.delete(submissionId);

        res.json({ status, code, time, verdict });
    } catch (error) {
        testcaseProgress.delete(submissionId);
        res.json(error);
    }
};

const getProgress = (req, res) => {
    const { submissionId } = req.params;
    const progress = testcaseProgress.get(submissionId) || 0;
    res.json({ runningTestcase: progress });
};

module.exports = { submissionVerdict, getProgress };
