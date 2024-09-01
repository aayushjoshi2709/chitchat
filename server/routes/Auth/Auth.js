const User = require("../../models/User/User");
const passport = require("passport");
const MulterUpload = require("../../middlewares/multer");
const logger = require("../../logger/logger");
const AuthRouter = require("express").Router();
// create user route
AuthRouter.post(
  "/register",
  MulterUpload.single("userImage"),
  function (req, res) {
    //adding the user to database
    logger = req.logger;
    logger.info("Going to register a user");
    let user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      image: req.file.path,
    };
    logger.debug("User: " + JSON.stringify(user));
    User.register(new User(user), req.body.password, function (error, user) {
      if (error) {
        logger.error("Error in registering user: " + error);
        return res.redirect("back");
      } else {
        logger.info("User registered successfully" + JSON.stringify(user));
        logger.info("Going to authenticate user");
        passport.authenticate("local")(req, res, function () {
          logger.info(
            "User authenticated successfully. Redirecting to messaging page"
          );
          res.redirect("/messaging");
        });
      }
    });
  }
);

AuthRouter.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/messaging",
  }),
  function (req, res) {}
);

// logout route
AuthRouter.get("/logout", function (req, res) {
  logger = req.logger;
  logger.info("Logging out user");
  req.logout();
  logger.info("User logged out successfully");
  res.redirect("/");
});

module.exports = AuthRouter;
