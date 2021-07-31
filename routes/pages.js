const e = require("connect-flash");
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
    res.render("add", {exists : req.flash("exists")});
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

router.get("/delete/:name", redirectLanding, (req, res) => {
    db.query("SELECT * FROM workstations WHERE name = ?", [req.params.name], (err, device) => {
        if(err){
            return console.log(err)
        } else {
            res.render("delete", {device});
        }
    });
});

router.get("/edit/:name", redirectLanding, (req, res) => {
    db.query("SELECT * FROM workstations WHERE name = ?", [req.params.name], (err, device) => {
        if(err){
            return console.log(err)
        } else {
            res.render("edit", {device});
        }
    })
});

router.get("/addjob/:name", redirectLanding, (req, res) => {
    db.query("SELECT name FROM workstations WHERE name = ?", [req.params.name], (err, name) => {
        if(err){
            return console.log(err);
        } else {
            res.render("addjob", {name});
        }
    });
});

router.get("/home/:name/:job_id", redirectLanding, (req, res) => {
    db.query("SELECT * FROM jobs WHERE job_id = ?", [req.params.job_id], (err, job) => {
        if(err){
            return console.log(err);
        }

        db.query("SELECT note FROM jobnotes WHERE job_id = ?", [req.params.job_id], (err, jobnotes) => {
            if(err){
                return console.log(err);
            } else {
                res.render("job", {job, jobnotes, updated : req.flash("updated")});
            }
        })
    })
});

router.get("/:jobname/addnote", redirectLanding, (req, res) => {
    db.query("SELECT job_id, jobname, name FROM jobs WHERE jobname = ?", [req.params.jobname], (err, job) => {
        if(err){
            return console.log(err);
        } else {
            res.render("addnote", {job});
        }
    })
});

router.get("/edit/job/:job_id", redirectLanding, (req, res) => {
    db.query("SELECT * FROM jobs WHERE job_id = ?", [req.params.job_id], (err, job) => {
        if(err){
            return console.log(err);
        } else {
            res.render("editjob", {job});
        }
    })
});

router.get("/close/job/:job_id", (req, res) => {
    db.query("SELECT * FROM jobs WHERE job_id = ?", [req.params.job_id], (err, job) => {
        if(err){
            return console.log(err);
        } else {
            res.render("closejob", {job});
        }
    })
});

router.get("/closedjobs/:name", (req, res) => {
    db.query("SELECT * FROM closedjobs WHERE name = ?", [req.params.name], (err, closedjobs) => {
        if(err){
            return console.log(err);
        } 

        if(!closedjobs[0]){
            req.flash("noclosedjobs", "No Closed Jobs Found");
            return res.render("noclosedjobs", {noclosedjobs: req.flash("noclosedjobs")})
        } else {
            res.render("closedjobs", {closedjobs});
        }
    })
});

router.get("/home/:name/:job_id", redirectLanding, (req, res) => {
    db.query("SELECT * FROM jobs WHERE job_id = ?", [req.params.job_id], (err, job) => {
        if(err){
            return console.log(err);
        }

        console.log(req.params.job_id);

        db.query("SELECT note FROM jobnotes WHERE job_id = ?", [req.params.job_id], (err, jobnotes) => {
            if(err){
                return console.log(err);
            } else {
                res.render("job", {job, jobnotes, updated : req.flash("updated")});
            }
        })
    })
});

router.get("/edit/job/:job_id", redirectLanding, (req, res) => {
    db.query("SELECT * FROM jobs WHERE job_id = ?", [req.params.job_id], (err, job) => {
        if(err){
            return console.log(err);
        } else {
            res.render("editjob", {job});
        }
    })
});

router.get("/close/job/:job_id", (req, res) => {
    db.query("SELECT * FROM jobs WHERE job_id = ?", [req.params.job_id], (err, job) => {
        if(err){
            return console.log(err);
        } else {
            res.render("closejob", {job});
        }
    })
});

router.get("/home/closedjob/:name/:job_id", (req, res) => {
    db.query("SELECT * FROM closedjobs WHERE job_id = ?", [req.params.job_id], (err, job) => {
        if(err){
            return console.log(err);
        } else {
            db.query("SELECT * FROM closedjobnotes WHERE job_id = ?", [req.params.job_id], (err, jobnotes) => {
                if(err){
                    return console.log(err);
                } else {
                    res.render("closedjob", {job, jobnotes});
                }
            });
        }
    }); 
});

module.exports = router;