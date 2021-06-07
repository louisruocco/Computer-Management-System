const express = require("express");
const session = require("express-session");
const path = require("path");
const { nextTick } = require("process");
const router = express.Router();

const redirectLanding = (req, res, next) => {
    if(!req.session.userId){
        return res.redirect("/");
    } else {
        next();
    }
}

const redirectHome = (req, res, next) => {
    if(req.session.userId){
        return res.redirect("/home");
    } else {
        next();
    }
}

router.get("/", redirectHome, (req, res) => {
    const { userId } = req.session;
    res.sendFile(path.join(__dirname, "../public/landing.html"));
});

router.get("/login", redirectHome, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get("/register", redirectHome, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/register.html"));
});

router.get("/home", redirectLanding, (req, res) => {
    res.render("home");
});

module.exports = router;