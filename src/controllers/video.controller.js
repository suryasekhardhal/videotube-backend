import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

console.log("video controller");


const uploadVideo = asyncHandler(async(req,res) =>{
    // get the video details 
    // get video and thumbnail local file path 
    // upload video on cloudinary
    // add video to the user profile
    // save the video to the user profile
    const {title,description} = req.body

    // if([title,description].some((field)=>field?.trim() === "")){
    //     throw new ApiError(400,"all video fileds are required")
    // }
    if(!title?.trim() || !description?.trim()) {
    throw new ApiError(400,"Title and description are required")
}
     const videoLocalPath = req.files?.videoFile?.[0].path
     if (!videoLocalPath) {
        throw new ApiError(400,"Video file is required")
     }
     const thumbnailLocalPath = req.files?.thumbnail?.[0].path
     if (!thumbnailLocalPath) {
        throw new ApiError(400,"Thumbnail file is required")
     }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    if (!videoFile) {
        throw new ApiError(500,"error while uploading video on cloudinary")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail) {
        throw new ApiError(500,"error while uploading thumbnail on cloudinary")
    }

    const video = await Video.create({
        title:title.trim(),
        description:description.trim(),
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        duration:videoFile.duration,
        owner:req.user?._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201,video,"video Uploaded successfully")
    )

})


const getAllMyVideo = asyncHandler(async(req,res) =>{
    // controller for fetching video 
// get the user 
// take the user id and using this id fetch the video from video model
// send res - video url

const userId = req.user?._id

if (!userId) {
    throw new ApiError(401,"User not found")
}

const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10

const aggregate = Video.aggregate([
    {
        $match:{
            owner:userId
        }
    },
    {
        $sort:{
            createdAt: -1
        }
    },
    {
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:[
                {
                    $project:{
                        fullname:1,
                        username:1,
                        avatar:1,
                        coverImage:1
                    }
                }
            ]
        }
    },
    {
        $unwind:"$owner"
    },
    
    {
        $lookup:{
            from:"subscriptions",
            let:{ownerId:"$owner._id"},
            pipeline:[
                {
                    $match:{
                        $expr:{
                            $eq:["$channel","$$ownerId"]
                        }
                    }
                },
                {
                    $count:"count"
                }
            ],
            as:"subscribersCount"
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            let:{ownerId:"$owner._id"},
            pipeline:[
                {
                    $match:{
                        $expr:{
                            $eq:["$subscriber","$$ownerId"]
                        }
                    }
                },
                {
                    $count:"count"
                }
            ],
            as:"subscribeToCount"
        }
    },
    {
  $addFields: {
    subscribersCount: {
      $ifNull: [{ $arrayElemAt: ["$subscribersCount.count", 0] }, 0]
    },
    subscribedToCount: {
      $ifNull: [{ $arrayElemAt: ["$subscribeToCount.count", 0] }, 0]
    }
  }
}
    
])
const videos = await Video.aggregatePaginate(aggregate,{page,limit})
return res
.status(200)
.json(
    new ApiResponse(200,videos,"video fetched successfully")
)

})


const watchVideo = asyncHandler(async(req,res) =>{
    // algo for watch video
    // get a single video
    // check video is available or not 
    // increase view of this particular video
    // send res including view

    const {videoId} = req.params
    const video = await Video.findByIdAndUpdate(videoId,{
        $inc:{views:1}
    },
    {
        new:true
    }
)

if (!video) {
    throw new ApiError(400,"video not found")
}

return res
.status(200)
.json(new ApiResponse(
    200,video,"video fetched successfully"
))
}) 


export {uploadVideo,getAllMyVideo,watchVideo}

