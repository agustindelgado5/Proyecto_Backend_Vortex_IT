const mongoose=require('mongoose')
const Schema=mongoose.Schema
const uniqueValidator=require('mongoose-unique-validator')
const userSchema= new Schema({

    name:{type:String,require:true},
    email:{type:String,require:true,unique:true},
    password:{type:String,require:true,minlength:6},
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
   
    
  
})
userSchema.plugin(uniqueValidator)
module.exports=mongoose.model('User',userSchema)