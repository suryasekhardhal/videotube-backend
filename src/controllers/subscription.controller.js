import {Subscription} from "../models/subscription.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import mongoose from "mongoose"
import { unsubscribe } from "diagnostics_channel"

const addSubscriber = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    
    if (!channelId ) {
        throw new ApiError(400,"channelid required")
    }
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
         throw new ApiError(400, "Invalid channelId")
    }
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400,"user not found")
    }

    if (channelId.toString()===userId.toString()) {
         throw new ApiError(400, "You cannot subscribe to your own channel")
    }

      const alreadySubscribed = await Subscription.findOne({
        channel: channelId,
        subscriber: userId
    })

    if (alreadySubscribed) {
        throw new ApiError(409, "Already subscribed")
    }
    
   
    const subscriber = await Subscription.create({
        subscriber:userId,
        channel:channelId
    })
    return res
    .status(200)
    .json(new ApiResponse(200,subscriber,"new Subscriber added"))
    


})

const removeSubscriber = asyncHandler(async(req,res)=>{
    // get channel id from params
    // get user from req.body
    // check if it subscribe 
    // if subscribe unsubscribe
    // return res
    const {channelId} = req.params
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400,"channel id is required")
    }
    const userId = req.user._id
    if (!userId) {
        throw new ApiError(400,"user id not found")
    }

    const isSubscribed = await Subscription.findOne({
        channel:new mongoose.Types.ObjectId(channelId),
        subscriber:userId
    })
    console.log(isSubscribed);
    

    if (!isSubscribed) {
        return res
        .status(200)
        .json(new ApiResponse(200,null, "You are not subscribed to this channel"))
    }

    const unSubscribe = await Subscription.findOneAndDelete({
        channel:channelId,
        subscriber:userId
    })
    console.log(unSubscribe);
    

    return res
    .status(200)
    .json(new ApiResponse(200,null,"Unsubscribed successfully"))
    
})

const getAllSubscriber = asyncHandler(async(req,res)=>{
    // get channelid from params
    // match with subscriptions channelid of every document and get all subscriber
    // return res
    const {channelId} = req.params
    if (!channelId) {
        throw new ApiError(400,"channelId required")
    }
    const allSubscriber = await Subscription.find(mongoose.Types.ObjectId.channelId)
    // console.log(allSubscriber);

    if (!allSubscriber) {
        throw new ApiError(401,"No subscriber found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,allSubscriber,"All subscriber fetched"))
     
})

export {addSubscriber,getAllSubscriber,removeSubscriber}