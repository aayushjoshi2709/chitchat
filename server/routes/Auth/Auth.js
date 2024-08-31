const User = require("../../models/User/User");
const passport = require("passport");
const MulterUpload = require("../../middlewares/multer");
const AuthRouter = require("express").Router();
// create user route
AuthRouter.post(
  "/register",
  MulterUpload.single("userImage"),
  function (req, res) {
    //adding the user to database
    let user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      image: req.file.path,
    };
    User.register(new User(user), req.body.password, function (error, user) {
      if (error) {
        return res.redirect("back");
      } else {
        passport.authenticate("local")(req, res, function () {
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
  req.logout();
  res.redirect("/");
});

module.exports = AuthRouter;
