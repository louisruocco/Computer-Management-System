const express = require("express");
const session = require("express-session");
const db = require("../database");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const e = require("connect-flash");
const router = express.Router();

router.post("/register", (req, res) => {
    const { name, password } = req.body;
    db.query("SELECT name FROM users WHERE name = ?", [name], async (err, user) => {
        if(err){
            req.flash("userexists", "Unable to Register User, Please Try Again");
            return res.redirect("/register");
        }

        if(user.length > 0){
            req.flash("userexists", "User Already Exists");
            return res.redirect("/register");
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
            req.flash("usernotfound", "User Not Found");
            return res.redirect("/login");
        }

        if(user[0] === undefined){
            req.flash("usernotfound", "User Not Found");
            return res.redirect("/login");
        }
       
        if(!user || !(await bcrypt.compare(password, user[0].password))){
            req.flash("usernotfound", "Incorrect Username or Password");
            return res.redirect("/login");
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
});

router.post("/delete/:name", (req, res) => {
    db.query("DELETE FROM workstations WHERE name = ?", [req.params.name], (err) => {
        if(err){
            return console.log(err)
        } else {
            db.query("DELETE FROM jobs WHERE name = ?", [req.params.name], (err) => {
                if(err){
                    return console.log(err);
                } else {
                    res.redirect("/home");
                }
            })
        }
    })
});

router.post("/edit/:name", (req, res) => {
    const { name, os, spec, storage } = req.body;
    db.query("UPDATE workstations SET ? WHERE name = ?", [{name: name, os: os, spec: spec, storage: storage}, req.params.name], (err) => {
        if(err){
            return console.log(err);
        } else {
            if(err){
                return console.log(err);
            } else {
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
            }
        }
    })
});

router.post("/addjob/:name", (req, res) => {
    const { jobname, description } = req.body;
    db.query("INSERT INTO jobs SET ?", {id: req.session.userId, name: req.params.name, jobname: jobname, description: description}, (err) => {
        if(err){
            return console.log(err);
        } 

        db.query("SELECT * FROM jobs WHERE name = ?", [req.params.name], (err, jobs) => {
            if(err){
                return console.log(err);
            } else {
                db.query("SELECT * FROM workstations WHERE name = ?", [req.params.name], (err, device) => {
                    if(err){
                        return console.log(err)
                    } else {
                        res.render("workstation", {device, jobs});
                    }
                })
            }
        })
    })
});

router.post("/note/:job_id", (req, res) => {
    const { note } = req.body;
    db.query("INSERT INTO jobnotes SET ?", {job_id: req.params.job_id, note: note}, (err) => {
        if(err){
            return console.log(err);
        } else {
            res.send(`
            <script>
                window.opener.location.reload();
                window.close();
            </script>`);
        }
    })
});

router.post("/edit/job/:job_id", (req, res) => {
    const { jobname, description} = req.body;
    db.query("UPDATE jobs SET ? WHERE job_id = ?", [{jobname: jobname, description: description}, req.params.job_id], (err) => {
        if(err){
            return console.log(err);
        } else {
            db.query("SELECT * FROM jobs WHERE job_id = ?", [req.params.job_id], (err, job) => {
                if(err){
                    return console.log(err);
                }
        
                db.query("SELECT note FROM jobnotes WHERE job_id = ?", [req.params.job_id], (err, jobnotes) => {
                    if(err){
                        return console.log(err);
                    } else {
                        req.flash("updated", "Job Updated");
                        res.render("job", {job, jobnotes, updated : req.flash("updated")});
                    }
                })
            })
        }
    })
})

module.exports = router;