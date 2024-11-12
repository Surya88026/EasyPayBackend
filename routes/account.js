const mongoose = require('mongoose');
const express = require('express');
const accountRouter = express.Router();
const authMiddleware = require('../middleware');
const { Account } = require('../db');

accountRouter.get('/balance',authMiddleware,async function(req,res){
    const account =await Account.findOne({userId:req.userId});
    if(!account){
        return res.json('Oops,Something went wrong!');
    }
    res.json({
        balance:account.balance
    })
})

accountRouter.post('/transfer',authMiddleware,async (req,res) => {
    const session = await mongoose.startSession();
    const sender = req.userId ;
    const receiver = req.body.to ;
    const amount = req.body.amount ;
    session.startTransaction();
    try{
        const sendersAccount =await Account.findOne({userId:sender},{session});
        if (!sendersAccount) {
            return res.status(400).json({ message: "Sender account not found" });
        }
        const currentBalance = sendersAccount.balance ;
        if(currentBalance < amount){
            return res.status(400).json({
                message:"Insufficient balance"
            })
        }
        const receiverAccount = await Account.findOne({
            userId:receiver
        },{session})

        if(!receiverAccount){
            return res.status(400).json({
                message:"Invalid Account"
            })
        }
        await Account.updateOne({userId:sender},{$inc:{
            balance:-amount
        }},{session})
        await Account.updateOne({
            userId:receiver
        },{
            $inc:{
                balance:amount
            }
        },{session})
        await session.commitTransaction();
        res.status(200).json({
            message:"Transfer Successful"
        })
    }catch(error){
        await session.abortTransaction();
        throw error ;
    }finally{
        session.endSession();
    }

})

module.exports ={
    account:accountRouter
}
