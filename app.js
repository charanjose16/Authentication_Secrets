//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();


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
    password: String,
    googleId:String,
    secret : String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user.id);
    });
  });
  
  passport.deserializeUser(function(id, cb) {
    User.findById(id)
      .then(function(user) {
        cb(null, user);
      })
      .catch(function(err) {
        cb(err);
      });
  });
  
  
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


 app.get("/",(req,res)=>{
    res.render("home");
 });

 app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] }));

 app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/secrets");
  });

 app.get("/login",(req,res)=>{
    res.render("login");
 });

 app.get("/register",(req,res)=>{
    res.render("register");
 });

 app.get("/secrets", async(req,res)=>{

    try {
      if (req.isAuthenticated()) {
        const foundUsers = await User.find({ secret: { $ne: null } });
        res.render("secrets", { usersWithSecrets: foundUsers });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.log(error);
    }
  });
  



 app.get("/submit",async(req,res)=>{
  if(req.isAuthenticated()){
    res.render("submit");
}
else{
    res.redirect("/login");
}
 });

 app.post("/submit", async (req, res) => {
  const submittedSecret = req.body.secret;

  try {
    const foundUser = await User.findById(req.user.id);

    if (foundUser) {
      foundUser.secret = submittedSecret;
      await foundUser.save();
      res.redirect("/secrets");
    }
  } catch (err) {
    console.log(err);
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