const mongoose = require("mongoose");
// creating message model with mongoose
const messageSchema = mongoose.Schema({
  from: {
    username: String,
  },
  to: {
    username: String,
  },
  status: { type: String, default: "NULL" },
  time: { type: Date, default: Date.now },
  message: String,
});
messageSchema.index({ "from.username": 1, "to.username": 1 });
module.exports = mongoose.model("Message", messageSchema);
