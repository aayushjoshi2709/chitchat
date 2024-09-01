const { EstablishSocket, afterConnect } = require("./sockets/socket");

const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  methodOverride = require("method-override"),
  userRouter = require("./routes/User/User.route"),
  authRouter = require("./routes/Auth/Auth.route"),
  logger = require("./logger/logger"),
  jwtStratery = require("./middlewares/passport.middleware"),
  isAuthenticated = require("./middlewares/isAuthenticated.middleware"),
  MessagesRouter = require("./routes/Messages/Messages.route");

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
socketObj = EstablishSocket(http);
afterConnect(socketObj);

http.listen(process.env.PORT, function () {
  logger.info("App started in port: " + process.env.PORT);
});

// passport configuration
passport.use(jwtStratery);
app.use(passport.initialize());

// added the winston logger to the request object
app.use((req, res, next) => {
  logger.info("Request received by user: " + JSON.stringify(req.user));
  req.logger = logger;
  next();
});
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/messages", isAuthenticated, MessagesRouter);
