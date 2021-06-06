const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const ejs = require("ejs");
const dotenv = require("dotenv");
const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Listening at " + port));

dotenv.config({path: "./.env"});
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set("view engine", "ejs");
app.use(session({
    name: process.env.SESS_NAME, 
    secret: process.env.SESS_SECRET, 
    resave: false, 
    saveUninitialized: false, 
}))