//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app = express();

console.log(process.env.API_KEY);

 app.use(express.static("public"));
 app.set('view engine','ejs');
 app.use(bodyParser.urlencoded({extended:true}));

 app.use(session({
    secret:"My little secret",
    resave:false,
    saveUninitialized: false
 }));

 app.use(passport.initialize());
 app.use(passport.session());

mongoose.connect("mongodb+srv://charanjoseph00:charansDB@cluster0.k9iozfz.mongodb.net/userDB",{useNewUrlParser:true});


const userSchema= new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


 app.get("/",(req,res)=>{
    res.render("home");
 });

 app.get("/login",(req,res)=>{
    res.render("login");
 });

 app.get("/register",(req,res)=>{
    res.render("register");
 });

 app.get("/secrets", async(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
 });

 app.get('/logout', (req, res, next)=>{
    req.logout(function(err) {
      if (err)
       { 
        return next(err);
      }
      res.redirect('/');
    });
  });
  
  

 app.post("/register", async (req, res) => {
    try {
      const newUser = new User({ username: req.body.username });
      await User.register(newUser, req.body.password);
  
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    } catch (err) {
      console.log(err);
      res.redirect("/register");
    }
  });
  

 
 app.post("/login", async (req, res) => {

    const user = new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user,async()=>{
        try{
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
        });
    }
        catch(err){
            console.log(err);
        }
    })
 });


 app.listen(3000 ,() =>{
     console.log("Server started at 3000");
 });