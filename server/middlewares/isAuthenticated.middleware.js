const User = require("../models/User/User.model");
// check if the user is logged in or not
const isAuthenticated = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    const err = new Error("Invalid token");
    err.status = 401;
    next(err);
  }
  await jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
    if (error) {
      const err = new Error("Invalid token");
      err.status = 401;
      next(err);
    }
    await User.findById(decoded.id, function (error, user) {
      if (error) {
        const err = new Error("Invalid token");
        err.status = 401;
        next(err);
      }
      req.user = user;
    });
    next();
  });
};
module.exports = isAuthenticated;
