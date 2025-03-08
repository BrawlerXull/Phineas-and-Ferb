const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
  email: { type: String, unique: true },
  password: String,
  userName: { type: String, required: true },
});

const userModel = mongoose.model("User", userSchema);
module.exports = {
  userModel,
};
