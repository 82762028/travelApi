import mongoose from "mongoose";
const { Schema } = mongoose; 
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  telephone: { type: String, required: true,unique: true},
  email: { type: String, required: true },
  password:{type:String, required:true},
  role:{type: String, enum:["admin","user","seller"],default:"user"},
  ville:{ type: String },
  createAt:{type:Date, default: Date.now},
  updateAt:{type:Date, default:Date.now},
  view: { type: Boolean, default: false },
  

});
const User = mongoose.model("User", userSchema)

export default User

