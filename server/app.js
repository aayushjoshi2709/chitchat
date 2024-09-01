const { EstablishSocket, afterConnect } = require("./sockets/socket");

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
  authRouter = require("./routes/Auth/Auth"),
  logger = require("./logger/logger");

app.use(methodOverride("_method"));
require("dotenv").config();

// set app to user body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// adding public dir to the app
app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));

// added the winston logger to the request object
app.use((req, res, net) => {
  req.logger = logger;
  net();
});
// creating user model with mongoose
mongoose.connect(process.env.databaseURL);

// configuring socket.io
const http = require("http").Server(app);
socketObj = EstablishSocket(http);
afterConnect(socketObj);

http.listen(process.env.PORT, function () {
  logger.info("App started in port: " + process.env.PORT);
  console.log("App started");
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
