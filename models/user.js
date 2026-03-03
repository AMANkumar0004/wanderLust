const { required } = require("joi");
const mongoose = require("mongoose");
const Schema= mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
    },
    wishlist:[
        {
            type:Schema.Types.ObjectId,
            ref:"Listing",
        }
    ],
    points:{
        type:Number,
        default:0,
        min:0,
    }
})


userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',userSchema);


