const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const executeCode = async (code, language, stdin = "") => {
    return new Promise((resolve, reject) => {
        const codeDir = path.join(__dirname, 'codes');

        if (!fs.existsSync(codeDir)) fs.mkdirSync(codeDir);

        const jobId = uuidv4();
        const jobDir = path.join(codeDir, jobId);
        fs.mkdirSync(jobDir);

        let fileName;
        if (language === 'cpp') fileName = 'output.cpp';
        else if (language === 'python') fileName = 'output.py';
        else if (language === 'java') fileName = 'output.java';
        else if (language === 'javascript') fileName = 'output.js';

        const filePath = path.join(jobDir, fileName);
        fs.writeFileSync(filePath, code);
        fs.writeFileSync(path.join(jobDir, 'input.txt'), stdin);

        const dirPath = jobDir.replace(/\\/g, "/");

        let command = "";
        const timeLimit=2;
        if (language === 'cpp') {
            command = `docker run --rm -v "${dirPath}:/app" gcc bash -c "cd /app && g++ ${fileName} -o a.out 2> error.txt; if [ -s error.txt ]; then cat error.txt; exit 1; fi; start=$(date +%s%3N); timeout ${timeLimit} ./a.out < input.txt; exit_code=$?; end=$(date +%s%3N); if [ $exit_code -eq 124 ]; then echo 'TLE'; else echo $((end - start)); fi"`;
        } else if (language === 'python') {
            command = `docker run --rm -v "${dirPath}:/app" python bash -c "cd /app && start=$(date +%s%3N); timeout ${timeLimit} python ${fileName} < input.txt; exit_code=$?; end=$(date +%s%3N); if [ $exit_code -eq 124 ]; then echo 'TLE'; else echo $((end - start)); fi"`;
        } else if (language === 'javascript') {
            command = `docker run --rm -v "${dirPath}:/app" node bash -c "cd /app && start=$(date +%s%3N); timeout ${timeLimit} node ${fileName} < input.txt; exit_code=$?; end=$(date +%s%3N); if [ $exit_code -eq 124 ]; then echo 'TLE'; else echo $((end - start)); fi"`;
        } else if (language === 'java') {
            command = `docker run --rm -v "${dirPath}:/app" openjdk bash -c "cd /app && javac ${fileName} 2> error.txt; if [ -s error.txt ]; then cat error.txt; exit 1; fi; start=$(date +%s%3N); timeout ${timeLimit} java output < input.txt; exit_code=$?; end=$(date +%s%3N); if [ $exit_code -eq 124 ]; then echo 'TLE'; else echo $((end - start)); fi"`;
        }

        exec(command, (err, stdout, stderr) => {
            if (fs.existsSync(codeDir)) {
                fs.rmSync(codeDir, { recursive: true, force: true });
            }
            
            if (err && !stdout.includes('TLE')) {
                return resolve({ error: stdout || stderr || err.message });
            }

            const outputLines = stdout.trim().split('\n');
            const lastLine = outputLines.pop();
            
            if (lastLine === 'TLE') {
                return resolve({ error: 'Time Limit Exceeded',time:timeLimit*1000  });
            }

            const timeInMs = parseInt(lastLine);
            const programOutput = outputLines.join('\n');
            resolve({ output: programOutput, time: timeInMs });
        });
    });
};

module.exports = { executeCode };
