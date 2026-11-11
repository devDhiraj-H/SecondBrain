import mongoose, { model, mongo, Schema } from "mongoose";


await mongoose.connect("mongodb://127.0.0.1:27017/secondBrain");


const UserSchema = new Schema({
    username : {type : String, unique : true},
    password : {type : String}
})

const ContentSchema = new Schema({
    title : String,
    link : String,
    tags : [{type : mongoose.Types.ObjectId, ref : 'Tag'}],
    userId : {type : mongoose.Types.ObjectId, ref : 'Users', required : true}
});

const Tags  = new Schema({
    
})

export const ContentModel = model("Content", ContentSchema);

export const UserModel = model("User", UserSchema); //User is the name of collection