import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"


const addComment = asyncHandler(async(req,res) =>{
    // algo for make a comment in controller
    // get a video by id 
    // add comment to the video
    // add owner details who commented
    const { videoId } = req.params
    const {comment} = req.body
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!comment || comment.trim() === "") {
        throw new ApiError(400, "Comment is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404,"Video not found")
    }

    const userComment = await Comment.create({
        content:comment,
        owner:req.user._id,
        video:videoId
    })
 
    return res
    .status(200)
    .json(new ApiResponse(200,userComment,"comment added successfully"))

})

const getAllComment = asyncHandler(async(req,res) => {

    // get the video id from video model
    // match video id with comments video id that store in comment model
    // display all match document(comment)
    // return res

    const {videoId} = req.params
    if (!videoId) {
        throw new ApiError(400,"video id not found")
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10
    const aggregate = Comment.aggregate([
        {
            $match:{
            video:new mongoose.Schema.Types.ObjectId(videoId)
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"user",
                 pipeline:[
                {
                    $project:{
                        fullname:1,
                        username:1,
                        avatar:1,
                    }
                }
            ]
            }
        },
        {
            $unwind:"$owner"
        }
    ])

    const comments = await Comment.aggregatePaginate(aggregate,{page,limit})

    return res
    .status(200)
    .json(new ApiResponse(200,comments,"All comment fetched successfully"))

})

export{addComment}