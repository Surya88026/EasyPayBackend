const express = require('express');
const userRouter = express.Router();
const z = require('zod');
const {User,Account} = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config');
const { authMiddleware } = require('../middleware');


const  signupbody = z.object({
    userName:z.string().email(),
    firstName:z.string(),
    lastName:z.string(),
    password:z.string().minLength(6)

})
userRouter.post('/signup',async function(req,res){
    
    const parseDataWithSuccess = signupbody.safeParse(req.body);
    if(!parseDataWithSuccess){
        res.statusCode(411).json({
            message: "Email already taken / Incorrect inputs"
        })
        return
    }
    const checkExistingUser = User.findOne({
        userName:req.body.userName
    })
    if(checkExistingUser){
        res.statusCode(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }
   
    const newUser = await User.create({
        userName:req.userName,
        firstName:req.firstName,
        lastName:req.lastName,
        password:req.password,
    })

    const userId = newUser._id;

    const newUserAccount = await Account.create({
        userId:userId,
        balance: 1 + Math.random()*10000
    })
    const token = jwt.sign({userId},JWT_SECRET);

    res.statusCode(200).json({
        message:"User created successfully",
        token: token
    });
})

const signingBody = z.object({
    userName:z.string().email(),
    password:z.string()
})
userRouter.post('/signin',function(req,res){
    const success = signingBody.safeParse(req.body);

    const userName = req.body.userName;
    const findUser = User.findOne({userName:userName});
    if(!findUser || !success){
        return res.statusCode(411).json({message: "Error while logging in / wrong inputs"});
    }
    const token = req.header('Authorization');
    if(!token){
        return res.statusCode.json({message: "Error while logging in"});
    }
    const verifyUser  = jwt.verify(token,JWT_SECRET);
    if(!verifyUser){
        return res.statusCode(411).json({message:"Invalid Token"});
    }
    res.statusCode(200).json({token});

    
})
const updateInfo = z.object({
    firstName:z.string().optional(),
    lastName:z.string().optional(),
    password:z.minLength(6).optional()
})
userRouter.put('/',authMiddleware,async function(req,res){
    const success = updateInfo.safeParse(req.body);
    if(!success){
        return res.status(411).json({message:"Error while updating information"});
    }
    try{
        await User.updateOne({
            _id:req.userId
        },req.body
        )
        res.status(200).json({message:"Updated successfully"});
    }catch(e){
        return res.status(411).json({message:"Error while updating information"});
    }

})

userRouter.get('/bulk/',authMiddleware,async function(req,res){
    const filter = req.query.filter || "" ;

    const users = await User.find({
        $or:[{
            firstName:{
                "$regex":filter
            }
        },
        {
            lastName:{
                "$regex":filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            userName:user.userName,
            firstName:user.firstName,
            lastName:user.lastName,
            _id:user._id
        }))
    })
})


module.exports = userRouter;
