const ioClient               = require('socket.io-client'),
      express                = require('express'),
      App                    = express(),
      mongoose               = require('mongoose'),
      bodyParser             = require('body-parser'),
      { Server }             = require('socket.io'),
      passport               = require('passport'),
      { createServer }       = require("http"),
      localStrategy          = require('passport-local'),
      passportLocalMongoose  = require('passport-local-mongoose');

App.set("view engine","ejs");
// set app to user body parser
App.use(bodyParser({extended:true}));
// adding public dir to the app
App.use(express.static(__dirname + "/public"));

// creating user model with mongoose
mongoose.connect(process.env.databaseURL);
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    username: String
});
// passport configuration
userSchema.plugin(passportLocalMongoose);
var User = mongoose.model("User",userSchema);
App.use(require('express-session')({
    secret:"hello world",
    resave:false,
    saveUninitialized: false
}));
App.use(passport.initialize());
App.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStrategy(User.authenticate()));
// creating message model with mongoose
const messageSchema = mongoose.Schema({
    from: String,
    to: String,
    time: String,
    message: String
});
var Message = mongoose.model("Message",messageSchema);
// root route
App.get("/",function(req,res){
    res.render('index')
})

// new user route
App.get("/register",function(req,res){
    res.render("./user/new");
});
// create user route
App.post("/register",function(req,res){
    //adding the user to database
    var user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username
    }
    User.register(new User(user),req.body.password,function(error,user){
        if(error){ 
            return res.redirect("back");
        }else {
            passport.authenticate('local')(req,res,function(){
                res.redirect("/messaging");
            });
        };
    });
});
// login route
App.get("/login",function(req,res){
    res.render("./user/login");
});
App.post("/login",passport.authenticate("local",{
    failureRedirect: "/login",
    successRedirect:"/messaging"
}),function(req,res){})
// messaging route
App.get("/messaging",isLoggedIn,function(req,res){
    res.render("./messaging/index");
});

// logout route
App.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});
// check if the user is logged in or not
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/login');
    }
}
// app server
App.listen(process.env.PORT,process.env.IP,function(){
    console.log("server started");
});