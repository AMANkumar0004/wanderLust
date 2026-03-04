const { required } = require("joi");
const mongoose = require("mongoose");
const Schema= mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')
const crypto = require("crypto");

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
    },
    resetPasswordToken: String,
resetPasswordExpires: Date
})

userSchema.methods.generateResetToken = function() {
  const token = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return token;
};
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',userSchema);


