const req = require('express/lib/request');

const ioClient               = require('socket.io-client'),
      express                = require('express'),
      app                    = express(),
      mongoose               = require('mongoose'),
      bodyParser             = require('body-parser'),
      { Server }             = require('socket.io'),
      passport               = require('passport'),
      { createServer }       = require("http"),
      localStrategy          = require('passport-local'),
      passportLocalMongoose  = require('passport-local-mongoose');

app.set("view engine","ejs");
// set app to user body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// adding public dir to the app
app.use(express.static(__dirname + "/public"));

// creating user model with mongoose
mongoose.connect(process.env.databaseURL);
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    username: String,
    socketid: String,
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        }
    ],
    friends:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});
// creating message model with mongoose
const messageSchema = mongoose.Schema({
    from:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: String,
    time: String,
    message: String
});
var Message = mongoose.model("Message",messageSchema);

// passport configuration
userSchema.plugin(passportLocalMongoose);
var User = mongoose.model("User",userSchema);
app.use(require('express-session')({
    secret:"hello world",
    resave:false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStrategy(User.authenticate()));

// create message route
app.post("/user/:id/message",function(req,res){
    var message = {
        from: mongoose.Types.ObjectId(req.params.id),
        to: mongoose.Types.ObjectId(req.body.to),
        time: req.body.time,
        message: req.body.message
    };
    User.findById(message.to,function(error,toUser){
        if(error) console.log("To user not found");    
        Message.create(message,function(error,message){
            if(error){
                console.log(error);
            }else{
                User.findById(message.from,function(error,fromUser){
                    if(error){
                        console.log(error);
                    }
                    toUser.messages.push(message._id);
                    toUser.save();
                    fromUser.messages.push(message._id);
                    fromUser.save();
                })
            }
        })
    })
});
// get all messages route
app.get("/user/:id/message",function(req,res){
    User.findById(req.params.id).populate('messages').exec(function(error,user){
        if(error) console.log(error);
        else{
            res.send(JSON.stringify(user.messages));
        }
    });
});

// create new friend route
app.post("/user/:id/friend",function(req,res){
    User.findById(req.params.id,function(error,user){
        if(error) console.log(error);
        else{
            user.friends.push(mongoose.Types.ObjectId(req.body.friend_id));
            user.save();
            res.send("{status:success}");
        }
    });
});

// get all friends route
app.get("/user/:id/friend",function(req,res){
    User.findById(req.params.id).populate('friends').exec(function(error,user){
        if(error) console.log(error);
        else{
            var friends = user.friends;
            friends.forEach(element => {
                delete element['messages'];
                console.log(element);
            });
            res.send(JSON.stringify(friends));
        }
    });
});

// root route
app.get("/",function(req,res){
    res.render('index')
})

// new user route
app.get("/register",function(req,res){
    res.render("./user/new");
});
// create user route
app.post("/register",function(req,res){
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
app.get("/login",function(req,res){
    res.render("./user/login");
});

app.post("/login",passport.authenticate("local",{
    failureRedirect: "/login",
    successRedirect:"/messaging"
}),function(req,res){})

// messaging route
app.get("/messaging",isLoggedIn,function(req,res){
    res.render("./messaging/index");
    console.log(req.user._id);
});

// logout route
app.get("/logout",function(req,res){
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
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("server started");
});