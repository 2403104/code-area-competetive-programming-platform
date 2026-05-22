const express=require('express');
const router=express.Router();
const {getAllContest,getContestById, registerUser, checkRegistered, unregisterUser, updateSubmission,updateCurentStanding, checkAccess}=require('../controllers/userContestController');

router.get('/get-all-contest',getAllContest);

router.post('/check-registered/:id',checkRegistered);
router.post('/register-user/:id',registerUser);
router.post('/unregister-user/:id',unregisterUser);
router.get('/get-contest/:id',getContestById);


router.post('/add-new-submission',updateSubmission);
router.post('/update-current-standing/:id',updateCurentStanding);
router.post('/check-contest-access/:id',checkAccess);
module.exports=router