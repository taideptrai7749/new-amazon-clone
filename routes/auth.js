const express = require("express");
const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const jswebtoken = require("jsonwebtoken");
const authRouter = express.Router();
const auth = require("../middlewares/auth");

//SIGN UP
authRouter.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({
                msg: 'User with same email already exist',
            });
        }
        const hashedPassword = await bcryptjs.hash(password, 8);
        let user = User({
            email,
            password: hashedPassword,
            name,
        });
        user = await user.save();
        res.json(user);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
    //return data to the user
});

//SIGN IN
authRouter.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                msg: "User doesn't exist",
            });
        }
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                msg: "Incorrect password",
            });
        }
        const token = jswebtoken.sign({ id: user._id }, "passwordKey");
        res.json({ token, ...user._doc });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//Check valid token
authRouter.post('/tokenIsValid', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.json(false);
        }
        const isVerified = jswebtoken.verify(token, 'passwordKey');
        if (!isVerified) {
            return res.json(false);
        }
        const user = await User.findById(isVerified.id);
        if (!user) {
            return res.json(false);
        }
        res.json(true);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//Get user data
authRouter.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user);
    res.json({ ...user._doc, token: req.token });
});
module.exports = authRouter;