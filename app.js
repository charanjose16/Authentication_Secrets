//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


const app = express();

console.log(process.env.API_KEY);

 app.use(express.static("public"));
 app.set('view engine','ejs');
 app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://charanjoseph00:charansDB@cluster0.k9iozfz.mongodb.net/userDB",{useNewUrlParser:true});

const userSchema= new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});


const User = new mongoose.model("User", userSchema);

 app.get("/",(req,res)=>{
    res.render("home");
 });

 app.get("/login",(req,res)=>{
    res.render("login");
 });

 app.get("/register",(req,res)=>{
    res.render("register");
 });

 app.post("/register",async(req,res)=>{
    const newUser = new User({
        email:req.body.username,
        password:req.body.password
    });

    try{
        newUser.save();
        res.send("Successfully registered");
    }
    catch(err){
        res.send(err);
    }
 });

 
app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username });
        if (foundUser && foundUser.password === password) {
            res.render("secrets");
        } else {
            res.send("Invalid username or password.");
        }
    } catch (err) {
        res.send(err);
    }
});

 app.listen(3000 ,() =>{
     console.log("Server started at 3000");
 });