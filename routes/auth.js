const express = require("express");
const session = require("express-session");
const db = require("../database");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/register", (req, res) => {
    const { name, password } = req.body;
    db.query("SELECT name FROM users WHERE name = ?", [name], async (err, user) => {
        if(err){
            return console.log(err);
        }

        if(user.length > 0){
            return res.send("<h1>User Already Exists</h1>")
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        db.query("INSERT INTO users SET ?", {name: name, password: hashedPassword}, (err) => {
            if(err){
                return console.log(err);
            } else {
                res.redirect("/login");
            }
        })
    })
});

router.post("/login", (req, res) => {
    const { name, password } = req.body;
    db.query("SELECT * FROM users WHERE name = ?", [name], async (err, user) => {
        if(err){
            return console.log(err);
        }
        
        if(!user || !(await bcrypt.compare(password, user[0].password))){
            return res.send("<h1>User Not Found</h1>")
        } else {
            const id = user[0].id;
            req.session.userId = id;
            res.redirect("/home");
        }
    })
})

router.post("/add", (req, res) => {
    const { id, name, os, spec, storage } = req.body;
    db.query("SELECT name FROM workstations WHERE name = ?", [name], (err, workstation) => {
        if(err){
            return console.log(err);
        }

        if(workstation.length > 0){
            return res.send("<h1>Workstation Already Exists</h1>")
        }

        db.query("INSERT INTO workstations SET ?", {id: req.session.userId, name: name, os: os, spec: spec, storage: storage}, (err) => {
            if(err){
                return console.log(err);
            } else {
                res.redirect("/home");
            }
        })
    })
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if(err){
            return res.redirect("/home");
        } else {
            res.clearCookie(process.env.SESS_NAME)
            res.redirect("/");
        }
    })
})

module.exports = router;