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
    res.render("landing");
});

router.get("/login", redirectHome, (req, res) => {
    res.render("login", { usernotfound : req.flash("usernotfound") });
});

router.get("/register", redirectHome, (req, res) => {
    res.render("register", { userexists : req.flash("userexists") });
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
                res.render("home", {name, workstations, updated : req.flash("updated")});
            }
        })
    })
});

router.get("/add", redirectLanding, (req, res) => {
    res.render("add");
});

router.get("/home/:name", redirectLanding, (req, res) => {
    db.query("SELECT * FROM workstations WHERE name = ?", [req.params.name], (err, device) => {
        if(err){
            return console.log(err)
        } else {
           db.query("SELECT * FROM jobs WHERE name = ?", [req.params.name], (err, jobs) => {
               if(err){
                   return console.log(err);
               } else {
                   res.render("workstation", {device, jobs});
               }
           })
        }
    })
});

router.get("/delete/:name", (req, res) => {
    db.query("SELECT * FROM workstations WHERE name = ?", [req.params.name], (err, device) => {
        if(err){
            return console.log(err)
        } else {
            res.render("delete", {device});
        }
    })
});

router.get("/edit/:name", (req, res) => {
    db.query("SELECT * FROM workstations WHERE name = ?", [req.params.name], (err, device) => {
        if(err){
            return console.log(err)
        } else {
            res.render("edit", {device});
        }
    })
});

router.get("/addjob/:name", (req, res) => {
    db.query("SELECT name FROM workstations WHERE name = ?", [req.params.name], (err, name) => {
        if(err){
            return console.log(err);
        } else {
            res.render("addjob", {name});
        }
    });
})

module.exports = router;