// check if the user is logged in or not
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}
module.exports = isAuthenticated;
