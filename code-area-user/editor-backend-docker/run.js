const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const executeSingleTestcase = async (req, res) => {
    let id = null;
    let jobDir = null;
    try {
        const { input, userCode, language } = req.body;
        const jobId = uuidv4();
        jobDir = path.join(__dirname, 'codes', jobId);

        try {
            fs.mkdirSync(jobDir, { recursive: true });
        } catch (e) {
            return res.json({
                output: "",
                time: 0,
                errType: "File Handling Error",
                errMessage: e.message
            });
        }

        let userFile = '';
        if (language === 'cpp') userFile = 'userCode.cpp';
        else if (language === 'python') userFile = 'userCode.py';
        else if (language === 'java') userFile = 'userCode.java';
        else if (language === 'javascript') userFile = 'userCode.js';

        try {
            fs.writeFileSync(path.join(jobDir, userFile), userCode);
            fs.writeFileSync(path.join(jobDir, 'input.txt'), input);
        } catch (e) {
            return res.json({
                output: "",
                time: 0,
                errType: "File Handling Error",
                errMessage: e.message
            });
        }

        const dirPath = jobDir.replace(/\\/g, "/");

        try {
            let setUpCommand = `docker run -dit -v "${dirPath}:/app" gcc-with-time bash`;
            id = execSync(setUpCommand).toString().trim();
        } catch (e) {
            return res.json({
                output: "",
                time: 0,
                errType: "Docker Error",
                errMessage: e.stderr?.toString() || e.message
            });
        }

        try {
            execSync(`docker start ${id}`);
        } catch (e) {
            return res.json({
                output: "",
                time: 0,
                errType: "Docker Start Error",
                errMessage: e.stderr?.toString() || e.message
            });
        }

        try {
            if(language === 'cpp'){
                execSync(`docker exec ${id} bash -c "cd /app && g++ userCode.cpp -o userCode"`);
            } else if(language === 'java'){
                execSync(`docker exec ${id} bash -c "cd /app && javac userCode.java"`);
            }
        } catch (e) {
            return res.json({
                output: "",
                time: 0,
                errType: "Compilation Error",
                errMessage: e.stderr?.toString() || e.stdout?.toString() || e.message
            });
        }

        const outputPath = path.join(jobDir, 'output.txt');
        const timePath = path.join(jobDir, 'time.txt');
        const exitCodePath = path.join(jobDir, 'exitCode.txt');

        fs.writeFileSync(outputPath, '');
        fs.writeFileSync(timePath, '');
        fs.writeFileSync(exitCodePath, '');

        const timeLimit = 2;

        try {
            let runCommand = "";

            if(language === 'cpp'){
                runCommand = `timeout ${timeLimit} ./userCode < input.txt > output.txt`;
            } else if(language === 'python'){
                runCommand = `timeout ${timeLimit} python3 userCode.py < input.txt > output.txt`;
            } else if(language === 'java'){
                runCommand = `timeout ${timeLimit} java userCode < input.txt > output.txt`;
            } else if(language === 'javascript'){
                runCommand = `timeout ${timeLimit} node userCode.js < input.txt > output.txt`;
            }

            execSync(`docker exec ${id} bash -c "cd /app && \
                start=\$(date +%s%3N); \
                ${runCommand}; \
                exit_code=\$?; \
                end=\$(date +%s%3N); \
                echo \$exit_code > exitCode.txt; \
                if [ \$exit_code -eq 124 ]; then \
                echo '2000' > time.txt; \
                else \
                echo \$((end - start)) > time.txt; \
                fi"`);

            execSync(`docker cp ${id}:/app/output.txt "${outputPath}"`);
            execSync(`docker cp ${id}:/app/time.txt "${timePath}"`);
            execSync(`docker cp ${id}:/app/exitCode.txt "${exitCodePath}"`);

            const exitCodeRaw = fs.readFileSync(exitCodePath, 'utf-8').trim();
            const exitCode = parseInt(exitCodeRaw);

            const result = fs.readFileSync(outputPath, 'utf-8').trim();

            let timeUsedRaw = fs.readFileSync(timePath, 'utf-8').trim();
            let timeUsed = parseFloat(timeUsedRaw);
            if (isNaN(timeUsed)) timeUsed = 0;
            else timeUsed = Math.min(timeLimit * 1000, timeUsed);

            if(exitCode === 124){
                return res.json({
                    output: "",
                    time: timeUsed,
                    errType: "Time Limit Exceeded",
                    errMessage: "Execution time exceeded the limit"
                });
            } else if(exitCode !== 0){
                return res.json({
                    output: result,
                    time: timeUsed,
                    errType: "Runtime Error",
                    errMessage: "Non-zero exit code"
                });
            }

            // fs.rmSync(jobDir, { recursive: true, force: true });

            return res.json({
                output: result,
                time: timeUsed,
                errType: "",
                errMessage: ""
            });

        } catch (e) {
            return res.json({
                output: "",
                time: 0,
                errType: "Execution Error",
                errMessage: e.message
            });
        }

    } catch (e) {
        return res.json({
            output: "",
            time: 0,
            errType: "Backend Error",
            errMessage: e.message
        });
    } finally {
        try {
            if (id) execSync(`docker rm -f ${id}`);
        } catch (e) { }
        try {
            if (jobDir && fs.existsSync(jobDir)) {
                fs.rmSync(jobDir, { recursive: true, force: true }); 
            }
        } catch (e) {}            
    }
};

module.exports = { executeSingleTestcase };
