const mongoose = require("mongoose");

const sessionsSchema = mongoose.Schema({
  _id: String,
  userid: String,
});

module.exports = mongoose.model("Sessions", sessionsSchema);
