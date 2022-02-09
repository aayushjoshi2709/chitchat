const express = require('express');
const App = express();
App.set("view engine","ejs");
// adding public dir to the app
App.use(express.static(__dirname + "/public"));
// root route
App.get("/",function(req,res){
    res.render('index')
})
// app server
App.listen(3000,"localhost",function(){
    console.log("server started");
});