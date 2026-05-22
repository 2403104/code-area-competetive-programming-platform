const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const HandleSignUp = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            return res.json({ success: false, error: "User Already Exist" });
        }
        if (password !== confirmPassword) {
            return res.json({ succes: false, error: "Password and Confirm Password do not matches" });
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            email,
            password: secPass,
            isAdmin: false
        });
        await newUser.save();
        console.log(newUser);
        const data = { user: { id: newUser.id, isAdmin: newUser.isAdmin } };
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY);
        res.json({ success: true, authToken });

    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, error });
    }
}
const HandleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ success: false, error: "Wrong Credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, error: "Wrong Credentials" });
        }
        const data = { user: { id: user.id, isAdmin: user.isAdmin } };
        const authToken = jwt.sign(data, process.env.JWT_SECRET_KEY);
        res.json({ success: true, authToken });
    } catch (error) {
        console.error(error);
        res.status(500).send({ succes: false, error });
    }

}
const GetUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        // console.log(user)
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
}
module.exports = { HandleSignUp, HandleLogin, GetUser }