const express                = require('express'),
      app                    = express(),
      mongoose               = require('mongoose'),
      bodyParser             = require('body-parser'),
      passport               = require('passport'),
      localStrategy          = require('passport-local'),
      passportLocalMongoose  = require('passport-local-mongoose');
      methodOverride         = require('method-override');
      cors                   = require('cors');
require('dotenv/config')
require('./')
app.use(methodOverride('_method'));
app.set("view engine","ejs");
app.use(cors({origin: "*"}))
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
    status: {type: String, default:"NULL"},
    time: {type: Date, default: Date.now},
    message: String
});
var Message = mongoose.model("Message",messageSchema);


// configuring socket.io
const http = require('http').Server(app);
const io = require('socket.io')(http,
    {cors: {
        origin: "http://"+process.env.IP+":"+process.env.PORT,
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },allowEIO3: true
}
);

http.listen(process.env.PORT,function(){
    console.log("App started");
}
)
// store socket id for a user on connection
io.on("connection", (socket) => {
    socket.on('user', function(data) {
        User.findByIdAndUpdate(data,{socketid:socket.id},function(error,user){
            if(error){
                console.log("error in updation socket id")
            }
        })
    });
    socket.on('new_message',function(message){
        User.findById(message.to,function(error,user){
            if(user.socketid !== "NULL"){
                io.to(user.socketid).emit("new_message", message);
            }
        });
    })
    socket.on('update_message_status_received',function(id){
        Message.findByIdAndUpdate(id,{status:"received"},function(error,message){
            if(error){
                console.log("cannot update status");
            }
            User.findById(message.from,function(error,user)
            {
                if(user.socketid !== "NULL")
                    io.to(user.socketid).emit('update_message_status_received', id);
            })
        });
    })
    socket.on('add_friend',function(id){
        User.findById(id,function(error,user){
            if(error) console.log(error);
            else{
                if(user.socketid !=="NULL"){
                    io.to(user.socketid).emit('add_friend', id);
                }
            }
        });
    })
    socket.on('update_message_status_seen',function(id){
        Message.findByIdAndUpdate(id,{status:"seen"},function(error,message){
            if(error){
                console.log("cannot update status");
            }
            User.findById(message.from,function(error,user)
            {
                if(user.socketid !== "NULL")
                    io.to(user.socketid).emit('update_message_status_seen', id);
            })
        });
    })
    socket.on('disconnect', function () {
        User.findOneAndUpdate({socketid:socket.id},{socketid:"NULL"},function(error,user){
            if(error){
                console.log("error in removing socket id")
            }
        })
    });
});
// passport configuration
userSchema.plugin(passportLocalMongoose);
var User = mongoose.model("User",userSchema);
app.use(require('cookie-session')({
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
    console.log(req.body.to);
    var message = {
        from: mongoose.Types.ObjectId(req.params.id),
        to: mongoose.Types.ObjectId(req.body.to),
        time: req.body.time || Date.now(),
        status:"sent",
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
                    if(toUser['messages'] === undefined){
                        toUser.messages =[];
                        toUser.messages.push(message._id);
                    }else{
                        toUser.messages.push(message._id);
                    }
                    toUser.save();
                    if(fromUser['messages'] === undefined)
                    {
                        fromUser.messages =[];
                        fromUser.messages.push(message._id);
                    }else{
                        fromUser.messages.push(message._id);
                    }
                    
                    fromUser.save();
                    res.send(JSON.stringify({status:"success",id:message._id}));
                })
            }
        })
    })
});


// group messages by sender id and remove extra info
function groupByKey(array,given_id) {  
    var res = {} 
    array.forEach(ele=>{
        var msg ={
            id: ele._id,
            message : ele.message,
            time: ele.time,
            from: ele.from._id,
            to: ele.to._id,
            status:ele.status
        }
        if(ele.to._id == given_id){
            var id =ele.from._id;
            if(res[id]){
                res[id].messages.push(msg);
            }else{
                res[id] = {"messages":[msg]};
                res[id].name = ele.from.firstName + " " + ele.from.lastName;
                res[id].username = ele.from.username;
            }
            res[id].lasttime = msg.time;
        }else if(ele.from._id ==given_id){
            var id =ele.to._id;
            if(res[id])
                res[id].messages.push(msg);
            else{
                res[id] = {"messages":[msg]};
                res[id].name = ele.to.firstName + " " + ele.to.lastName;
                res[id].username = ele.to.username;
            }
            res[id].lasttime = msg.time;
        }
    });
    return res;
}

// sort grouped messages by last recieved custom comparator
function comparator(a,b){
    
    if(a[1].lasttime > b[1].lasttime)
        return -1;
    else if (a[1].lasttime < b[1].lasttime)
        return 1;
    else
        return 0;
}
// sort messages by last time
function sortMessages(result){
    var arr =[];
    var res = {};
    for (var key in result) {
        arr.push([key, result[key]]);
    }
    arr.sort(comparator);
    arr.forEach(element=>{
        res[element[0]] = element[1];
    });
    return res;
}
// get all messages route
app.get("/user/:id/message",function(req,res){
    User.findById(req.params.id).populate({path:'messages',
       populate:{path:'from to'}
    }).exec(function(error,user){
        if(error) console.log(error);
        else{
            // group all elements by person
            var result = groupByKey(user.messages,req.params.id);
            // sort all element by last time recieved
            res.send(JSON.stringify(sortMessages(result)));
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
            User.findById(req.body.friend_id,function(error,friend){
                if(error) console.log(error);
                else{
                    friend.friends.push(mongoose.Types.ObjectId(req.params.id));
                    friend.save();
                }    
            });
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
            res.send(JSON.stringify(friends));
        }
    });
});
// search friends by name
app.get("/user/:id/friend/search/:query",function(req,res){
    let query = req.params.query;
    User.find({username:query} ,function(error,user){
        if(error) console.log(error);
        else{
            res.send(JSON.stringify(user));
        }
    });
});
// delete friend
app.delete("/user/:id/friend/",function(req,res){
    User.findById(req.params.id,function(error,user){
        if(error) console.log(error);
        user.friends.remove(req.body.id);
        user.save();
        User.findById(req.body.id,function(error,xfriend){
            if(error) console.log(error);
            xfriend.friends.remove(req.params.id);
            xfriend.save();
        })
        res.send(JSON.stringify({status:"success"}));
    });
});

// create user route
app.post("/register",function(req,res){
    //adding the user to database
    let user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username
    }
    User.register(new User(user),req.body.password,function(error,user){
        if(error){ 
            return res.send({status:"error"});
        }else {
            passport.authenticate('local')(req,res,function(){
                res.status(200).send(req.user);
            });
        };
    });
});

app.post("/login",function(req,res,next){
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).send('Incorrect username');
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            res.status(200).send(req.user);
        });
    })(req, res, next);
})

// logout route
app.get("/logout",function(req,res){
    req.logout();
    res.status(200).send("logged out");
});
// check if the user is logged in or not
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/login');
    }
}
