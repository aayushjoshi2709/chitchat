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
  MessagesRouter = require("./routes/Messages/Messages.route"),
  FriendRouter = require("./routes/Friend/Friend.route"),
  { EstablishSocket, afterConnect } = require("./sockets/socket"),
  cors = require("cors");
app.use(methodOverride("_method"));
require("dotenv").config();

// set app to use cors
app.use(
  cors({
    origin: "*",
  })
);
// set app to user body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// adding public dir to the app
app.use("/uploads", express.static("uploads"));
// creating user model with mongoose
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_URI, {
  useUnifiedTopology: true,
  minPoolSize: 10,
  maxPoolSize: 20,
});

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
  req.logger = logger;
  next();
});
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/messages", isAuthenticated, MessagesRouter);
app.use("/friends", isAuthenticated, FriendRouter);
