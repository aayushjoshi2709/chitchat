const mongoose = require("mongoose");
// creating message model with mongoose
const messageSchema = mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: { type: String, default: "NULL" },
  time: { type: Date, default: Date.now },
  message: String,
});
module.exports = mongoose.model("Message", messageSchema);
