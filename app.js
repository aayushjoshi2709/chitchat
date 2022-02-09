const express = require('express');
const App = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// creating user model with mongoose
mongoose.connect(process.env.databaseURL);
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
        else console.log(user);
    });
})


// app server
App.listen(process.env.PORT,process.env.IP,function(){
    console.log("server started");
});