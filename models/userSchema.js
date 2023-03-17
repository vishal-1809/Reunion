const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const userSchema = mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  resetToken:String,
  expireToken:Date,
  followers: [{type:ObjectId,ref:"User"}],
  following: [{type:ObjectId,ref:"User"}],
});

module.exports = mongoose.model("User", userSchema);