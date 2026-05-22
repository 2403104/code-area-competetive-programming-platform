const express=require('express');
const router=express.Router();
const {HandleSignUp, HandleLogin, GetUser}=require('../controllers/authController');
const { fetchUser } = require('../middleware/fetchUser');

router.post('/codearea-signup',HandleSignUp);
router.post('/codearea-login',HandleLogin);
router.get('/codearea-getuser',fetchUser,GetUser)
module.exports=router