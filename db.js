const mongoose = require('mongoose');
const { Schema } = require('zod');

await mongoose.connect('connection string'); 



const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        require:true,
        trim:true,
        minLength:3,
        maxLength:30
    },
    firstName:{type:String,require:true,trim:true},
    lastName:{type:String},
    password:{
        type:String,
        required:true,
        minLength:6
    },
    

});

const AccountSchema = new mongoose.Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    balance:{
        type:Number,
        required:true
    },
    
});

const User = mongoose.model('users',userSchema);
const Account = mongoose.model('accounts',AccountSchema);
module.exports = {
    User:User,
    Account:Account,
}