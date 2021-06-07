const express = require("express");
const session = require("express-session");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
    const { userId } = req.session;
    res.sendFile(path.join(__dirname, "../public/landing.html"));
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/register.html"));
});

router.get("/home", (req, res) => {
    res.render("home");
});

module.exports = router;