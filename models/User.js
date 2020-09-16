const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  emailid: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    type: Array,
    default: [],
  },
  orders: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("User", userSchema);
