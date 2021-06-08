const express = require("express");
const session = require("express-session");
const path = require("path");
const db = require("../database");
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
    db.query("SELECT name FROM users WHERE id = ?", [req.session.userId], (err, name) => {
        if(err){
            return console.log(err);
        } 

        db.query("SELECT * FROM workstations WHERE id = ?", [req.session.userId], (err, workstations) => {
            if(err){
                return console.log(err)
            } else {
                res.render("home", {name, workstations});
            }
        })
    })
});

router.get("/add", redirectLanding, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/add.html"));
});

router.get("/home/:name", (req, res) => {
    db.query("SELECT * FROM workstations WHERE name = ?", [req.params.name], (err, workstation) => {
        if(err){
            return console.log(err)
        } else {
            res.render("workstation", {workstation});
        }
    })
})

module.exports = router;