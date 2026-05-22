const User = require('../models/user');
const updateUser = async (req, res) => {
    try {
        const { problemId, code, status, time,errType,errMessage, verdicts } = req.body;
        const userId = req.user.id;
        const newSubmission = {
            problemId,
            status,
            errType,
            errMessage,
            code,
            time,
            verdicts,
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        user.submissionList.unshift(newSubmission);
        const today = new Date().toISOString().slice(0, 10);
        const currCnt=user.solvedTimeLine.get(today) || 0;
        user.solvedTimeLine.set(today,currCnt+1);
        await user.save();
        res.json({ success: true, message: 'Submission saved successfully' });
    } catch (error) {
        console.error("Error saving submission:", error);
        res.status(500).json({ error: 'Server error' });
    }
}
const userProfile=async (req,res)=>{
    try {
        const {username}=req.params;
        const user=await User.findOne({username});
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({success:true,user:user});
    } catch (error) {
        console.error("Error saving submission:", error);
        res.status(500).json({ error: 'Server error' });        
    }
}
module.exports = { updateUser,userProfile }