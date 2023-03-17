const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const postSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    likes:[{type:ObjectId,ref:"User"}],
    comments:[{
        text:String,
        postedBy:{type:ObjectId,ref:"User"}
    }],
    postedBy:{
       type:ObjectId,
       ref:"User"
    }
},{timestamps: true,});

module.exports = mongoose.model('PostMessage', postSchema);
