const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const fs = require('fs');
const path = require('path');
const { Dolos } = require("@dodona/dolos-lib");
const {client} = require('../redis/client');
require('dotenv').config();

router.post('/:contestId/:problemId/check-plag', async (req, res) => {

  let filePaths = [];
  let tempDir = null; 
  try {
    const cacheKey = `plag_result_${req.params.contestId}_${req.params.problemId}`;

    const cachedResult = await client.get(cacheKey);
    if (cachedResult) {
      return res.json(JSON.parse(cachedResult));
    }

    const contest = await Contest.findById(req.params.contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    
    const targetProblemId = req.params.problemId;
    const problemSubmissions = [];

    
    const submissionMap = new Map();
    let counter = 1;

    contest.submissions.forEach((userGroup) => {
      const userProblemSubs = userGroup.mySubmissions.filter(
        (sub) => sub.problemId.toString() === targetProblemId.toString()
      );

      if (userProblemSubs.length > 0) {
        userProblemSubs.forEach((sub) => {
          const isAccepted = sub.status === "Accepted" || sub.status === "AC";
          
          if (isAccepted && sub.code && sub.code.length > 0) {
            const currentSubId = counter++;
            const submissionData = {
              username: userGroup.username,
              sourceCode: sub.code[0].sourceCode,
              subId: currentSubId, 
              language: sub.code[0].language || "cpp"
            };

            problemSubmissions.push(submissionData);
            
            submissionMap.set(currentSubId, {
              username: userGroup.username,
              lang: submissionData.language,
              sourceCode: submissionData.sourceCode
            });
          }
        });
      }
    });

    if (problemSubmissions.length < 2) {
      return res.json({ 
        status: "skipped", 
        message: "Not enough accepted submissions to run analysis.", 
        reports: [] 
      });
    }

    tempDir = path.join(__dirname, `../temp_plag_${req.params.contestId}_${targetProblemId}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    problemSubmissions.forEach((sub) => {
      const langStr = sub.language.toLowerCase();
      const ext = langStr.includes("python") ? "py" : 
                  langStr.includes("java") ? "java" : "cpp";

      const fileName = `${sub.username}_sub_${sub.subId}.${ext}`;
      const filePath = path.join(tempDir, fileName);
      
      fs.writeFileSync(filePath, sub.sourceCode);
      filePaths.push(filePath);
    });

    const dolos = new Dolos();
    const report = await dolos.analyzePaths(filePaths);

    const reportsSummary = []; 

    for (const pair of report.allPairs()) {
      const similarityPercentage = Math.round(pair.similarity * 100);

      const leftFileName = path.basename(pair.leftFile.path);
      const rightFileName = path.basename(pair.rightFile.path);

      const subIdA = parseInt(leftFileName.split('_sub_').pop(), 10);
      const subIdB = parseInt(rightFileName.split('_sub_').pop(), 10);

      const userAData = submissionMap.get(subIdA);
      const userBData = submissionMap.get(subIdB);
        
      if (!userAData || !userBData || userAData.username === userBData.username) continue;

      reportsSummary.push({
        similarity: similarityPercentage,
        overlap: pair.overlap,
        userA: userAData,
        userB: userBData
      });
    }

    reportsSummary.sort((a, b) => b.similarity - a.similarity);

    const data = {
      status: "success",
      totalAcceptedChecked: problemSubmissions.length,
      reports: reportsSummary
    }

    await client.set(cacheKey, JSON.stringify(data), 'EX', Number(process.env.REDIS_TTL || 86400));

    return res.json(data);

  } catch (err) {
    return res.status(500).json({ message: "Plagiarism run failed: " + err.message });
  } finally {
    try {
      filePaths.forEach((fp) => { 
        if (fs.existsSync(fp)) fs.unlinkSync(fp); 
      });
      if (tempDir && fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir);
      }
    } catch (cleanupErr) {
      console.error("Disk cleanup failed:", cleanupErr);
    }
  }
});

module.exports = router;