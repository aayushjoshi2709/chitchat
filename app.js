const express = require('express');
const App = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// creating user model with mongoose
mongoose.connect("mongodb+srv://aayush:M1wYnF3LD9wbxVNl@cluster0.lujj9.mongodb.net/chitchat?retryWrites=true&w=majority");
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    userName: String
});
var User = mongoose.model("User",userSchema);
// creating message model with mongoose
const messageSchema = mongoose.Schema({
    form: String,
    to: String,
    time: String,
    message: String
});
var message = mongoose.model("Message",messageSchema);

App.set("view engine","ejs");

// set app to user body parser
App.use(bodyParser({extended:true}));
// adding public dir to the app
App.use(express.static(__dirname + "/public"));
// root route
App.get("/",function(req,res){
    res.render('index')
})
// new user route
App.get("/user/new",function(req,res){
    res.render("./user/new");
})
// create user route
App.post("/user",function(req,res){
    //adding the user to database
    User.create(req.body.user,function(error,user){
        if(error) console.log(error);
        else {
            console.log(user);
            res.redirect("/user/"+user._id+"/messaging");
        };
    });
})

// messaging route
App.get("/user/:id/messaging",function(req,res){
    res.render("./messaging/index");
})


// app server
App.listen(process.env.PORT,process.env.IP,function(){
    console.log("server started");
});