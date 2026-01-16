// import mongoose, {Schema} from "mongoose";

// const likeSchema = new Schema({
//     comment:{
//         type:Schema.Types.ObjectId,
//         ref:"Comment"
//     },
//     video:{
//         type:Schema.Types.ObjectId,
//         ref:"Video"
//     },
//     likedBy:{
//         type:Schema.Types.ObjectId,
//         ref:"User"
//     },
//     tweet:{
//         type:Schema.Types.ObjectId,
//         ref:"Tweet"
//     }
// },{timestamps:true})

// export const Like = mongoose.model("Like",likeSchema)

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema(
  {
    likeType: {
      type: String,
      enum: ["Video", "Comment", "Tweet"],
      required: true,
    },
    likeTarget: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "likeType",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes
likeSchema.index(
  { likeType: 1, likeTarget: 1, likedBy: 1 },
  { unique: true }
);
likeSchema.plugin(mongooseAggregatePaginate)

export const Like = mongoose.model("Like", likeSchema);
