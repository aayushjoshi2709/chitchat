const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  localStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  User = require("./models/User/User"),
  Message = require("./models/Messages/Messages"),
  userRouter = require("./routes/User/User"),
  authRouter = require("./routes/Auth/Auth");
app.use(methodOverride("_method"));
require("dotenv").config();

// set app to user body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// adding public dir to the app
app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));
// creating user model with mongoose
mongoose.connect(process.env.databaseURL);

// configuring socket.io
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://" + process.env.IP + ":" + process.env.PORT,
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
});

http.listen(process.env.PORT, function () {
  console.log("App started");
});
// store socket id for a user on connection
io.on("connection", (socket) => {
  socket.on("user", function (data) {
    User.findByIdAndUpdate(
      data,
      { socketid: socket.id },
      function (error, user) {
        if (error) {
          console.log("error in updation socket id");
        }
      }
    );
  });
  socket.on("new_message", function (message) {
    User.findById(message.to, function (error, user) {
      if (user.socketid !== "NULL") {
        io.to(user.socketid).emit("new_message", message);
      }
    });
  });
  socket.on("update_message_status_received", function (id) {
    Message.findByIdAndUpdate(
      id,
      { status: "received" },
      function (error, message) {
        if (error) {
          console.log("cannot update status");
        }
        User.findById(message.from, function (error, user) {
          if (user.socketid !== "NULL")
            io.to(user.socketid).emit("update_message_status_received", id);
        });
      }
    );
  });
  socket.on("add_friend", function (id) {
    User.findById(id, function (error, user) {
      if (error) console.log(error);
      else {
        if (user.socketid !== "NULL") {
          io.to(user.socketid).emit("add_friend", id);
        }
      }
    });
  });
  socket.on("update_message_status_seen", function (id) {
    Message.findByIdAndUpdate(
      id,
      { status: "seen" },
      function (error, message) {
        if (error) {
          console.log("cannot update status");
        }
        User.findById(message.from, function (error, user) {
          if (user.socketid !== "NULL")
            io.to(user.socketid).emit("update_message_status_seen", id);
        });
      }
    );
  });
  socket.on("disconnect", function () {
    User.findOneAndUpdate(
      { socketid: socket.id },
      { socketid: "NULL" },
      function (error, user) {
        if (error) {
          console.log("error in removing socket id");
        }
      }
    );
  });
});
// passport configuration

app.use(
  require("cookie-session")({
    secret: "hello world",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStrategy(User.authenticate()));
app.use("/user", userRouter);
app.use("/auth", authRouter);
