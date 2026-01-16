import { Like } from "../models/like.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import mongoose from "mongoose"


// const like = asyncHandler(async(req,res) =>{
//     // get a video by id
//     // validate video
//     // get owner avatar and username
//     // save in like model
//     // and count the like
//     const {type,id} = req.params

//     if (!type || !id) {
//         throw new ApiError(400,"invalid like type or id")
//     }

//     const userId = req.user._id

//     const typeMap = {
//         video:"Video",
//         comment:"Comment"
//     }

//     if (!typeMap[type]) {
//         throw new ApiError(400,"Invalid like type")
//     }

//     const likeType = typeMap[type]
//     const likeTarget = id

//     const model = mongoose.model(likeType)
//     const getVOrC = await model.findById(likeTarget)

//     if (!getVOrC) {
//         throw new ApiError(400,"VIDEO OR COMMENT NOT FOUND")
//     }
    

//     const existingLike = await Like.findOne({
//         likeType,
//         likeTarget,
//         likedBy:userId
//     })

//     if (existingLike) {
//         await Like.findOneAndDelete({_id:existingLike?._id})

//         return res
//         .status(200)
//         .json(new ApiResponse(200,`${likeType} is unlike successfully`))
//     }
//     const likes =await Like.create({
//         likeType,
//         likeTarget,
//         likedBy:userId
//     })

//     return res
//     .status(200)
//     .json(new ApiResponse(200, likes,"Like add successfully"))
// })

const like = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const userId = req.user._id;

  if (!type || !id) {
    throw new ApiError(400, "Invalid like type or id");
  }

  const typeMap = {
    video: "Video",
    comment: "Comment"
  };

  if (!typeMap[type]) {
    throw new ApiError(400, "Invalid like type");
  }

  const likeType = typeMap[type];
  const likeTarget = id;

  const Model = mongoose.model(likeType);
  const exists = await Model.exists({ _id: likeTarget });

  if (!exists) {
    throw new ApiError(404, `${likeType} not found`);
  }

  const existingLike = await Like.findOne({
    likeType,
    likeTarget,
    likedBy: userId
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });

    return res.status(200).json(
      new ApiResponse(200, { liked: false }, "Unliked successfully")
    );
  }

  await Like.create({
    likeType,
    likeTarget,
    likedBy: userId
  });

  return res.status(200).json(
    new ApiResponse(200, { liked: true }, "Liked successfully")
  );
});


const getAllLike = asyncHandler(async(req,res) =>{
    const {type,id} = req.params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!type || !id) {
        throw new ApiError(400,"Type or id is invalid")
    }

     //  Map type
  const typeMap = {
    video: {
      model: "Video",
      collection: "videos",
      project: { title: 1, thumbnail: 1 }
    },
    comment: {
      model: "Comment",
      collection: "comments",
      project: { content: 1 }
    }
  };

  if (!typeMap[type]) {
    throw new ApiError(400, "Invalid like type");
  }

  const { model, collection, project } = typeMap[type];
  const likeTarget = new mongoose.Types.ObjectId(id);

  const TargetModel = mongoose.model(model);
  const exists = await TargetModel.exists({ _id: likeTarget });

  if (!exists) {
    throw new ApiError(404, `${model} not found`);
  }

  //  Aggregate pipeline
  const likes = await Like.aggregate([
    {
      $match: {
        likeType: model,
        likeTarget
      }
    },
    { 
        $sort: { 
            createdAt: -1 
        } 
    },
    { 
        $skip: skip 
    },
    { 
        $limit: limit 
    },

    // 🔗 USER LOOKUP
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    { 
        $unwind: "$user" 
    },

    // 🔗 TARGET LOOKUP (video/comment)
    {
      $lookup: {
        from: collection,
        localField: "likeTarget",
        foreignField: "_id",
        as: "target",
        pipeline: [
          {
            $project: project
          }
        ]
      }
    },
    { 
        $unwind: "$target" 
    },

    // 🎯 FINAL SHAPE
    {
      $project: {
        _id: 1,
        likedBy: "$user",
        target: 1,
        createdAt: 1
      }
    }
  ]);

  //  Total count
  const totalLikes = await Like.countDocuments({
    likeType: model,
    likeTarget
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        likes,
        page,
        limit,
        totalLikes,
        totalPages: Math.ceil(totalLikes / limit)
      },
      "Likes fetched successfully"
    )
  );





})

export {like,getAllLike}