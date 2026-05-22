const express=require('express');
const router=express.Router();
const {updateUser, userProfile}=require('../controllers/userController');
const {fetchUser}=require('../middleware/fetchUser')
router.post('/update-user',fetchUser,updateUser);
router.get('/user-profile/:username',userProfile);
module.exports=router 