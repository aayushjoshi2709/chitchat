const mongoose = require("mongoose");
// creating message model with mongoose
const messageSchema = mongoose.Schema({
  from: {
    username: {
      type: String,
      required: true,
    },
  },
  to: {
    username: {
      type: String,
      required: true,
    },
  },
  status: { type: String, default: "sent" },
  time: { type: Date, default: Date.now },
  message: String,
});
messageSchema.index({ "from.username": 1, "to.username": 1 });
module.exports = mongoose.model("Message", messageSchema);
