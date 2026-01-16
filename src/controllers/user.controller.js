import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error in generating access and refresh token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;
    //console.log("email:", email);
    //console.log("Register User : ", registerUser);

    // validation
    if (
        [fullname, email, password, username].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    // this is the simple method you can use
    // if (fullname === "") {
    //     throw new ApiError(400,"fullname required")
    // }

    // user already exist or not
    const exitedUser = await User.findOne({
        $or: [{ email }, { username }],
    });
    //console.log("existed User: ", exitedUser);

    if (exitedUser) {
        throw new ApiError(409, "username or email is exist");
    }

    // file handling

    const avatarLocalpath = req.files?.avatar[0]?.path;
    //console.log("Avatar local file path : ", avatarLocalpath);

    //const coverimageLocalpath  = req.files?.coverImage[0]?.path;
    //console.log("CoverImage Loacal File Path: ", coverimageLocalpath);

    let coverimageLocalpath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverimageLocalpath = req.files.coverImage[0].path;
    }

    //console.log(req.files);

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalpath);
    //console.log("Avatar cloudinary file path : ", avatar);

    const coverImage = await uploadOnCloudinary(coverimageLocalpath);
    //console.log("Avatar cloudinary file path : ", coverImage);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    // create user in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        email,
        username: username.toLowerCase(),
    });
    // console.log("User in db : ",user);

    const createduser = await User.findById(user._id).select(
        //select method by default select
        "-password -refreshToken" //all you should say which is going to be not select
    );
    // console.log("Craeated User : ",createduser);

    if (!createduser) {
        throw new ApiError(500, "server issue user not crated");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createduser, "user register successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!(email || username)) {
        throw new ApiError(400, "Email or Username required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist Register now");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(100, "Incorrect password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findOne(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    refreshToken,
                    accessToken,
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findOneAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user loged out"));
});

const refreshAccessToken = asyncHandler(async (req,res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError()
    }

   try {
     const decodedToken = jwt.verify(incomingRefreshToken,REFRESH_TOKEN_SECRET)
 
     const user = await User.findById(decodedToken?._id)
 
     if (!user) {
         throw new ApiError(401,"invalid refresh Token")
     }
 
     if (incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401,"Refresh Token Expired or used")
     }
 
     const options = {
         httpOnly:true,
         secure:true
     }
 
     const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
 
     return res
     .status(200)
     .cookie("refreshToken",newRefreshToken,options)
     .cookie("accessToken",accessToken,options)
     .json(new ApiResponse(
         200,
         {
         accessToken,refreshToken:newRefreshToken
         },
         "Successfully add access Token"
 ))
   } catch (error) {
    throw new ApiError(401,"invalid refresh Token")
   }
})

const changeCurrentPassword = asyncHandler(async (req, res) =>{
    const {oldPassword,newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)//recheck if error

    if (!isPasswordCorrect) {
        throw new ApiError(400,"Invalid Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false}) //chatgpt

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Password change successfully"
    ))


})

const getCurrentUser = asyncHandler(async (req,res) =>{
    return res
    .status(200)
    .json(200,req.user,"User fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req,res) =>{
    const {fullname,email}=req.body
    if (!(fullname || email)) {
        throw new ApiError(400,"fullname or email required")
    }
    const user  = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) =>{
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar Image uploading error")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(500,"error while uploading avatar on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar updated successfully"))
})

const updateUsercoverImage = asyncHandler(async(req,res) =>{
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400,"coverimage update error Image")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImageLocalPath.url) {
        throw new ApiError(500,"error while uploading in cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async(req,res) =>{
    const {username} = req.params
    if (!username?.trim()) {
        throw new ApiError(400,"username missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username:username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                channelsSubscribeToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond: {
                        if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscriberCount:1,
                channelsSubscribeToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1
            }
        }
    ])
    console.log(channel);

    if (!channel?.length) {
        throw new ApiError(404,"channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"channel details fetched successfully")
    )
    
})

const getWatchHistory = asyncHandler(async(req,res) =>{
    const user = await User.aggregate([
        {
            $match: {
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
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
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched successfully")
    )
})



export { 
    registerUser, 
    loginUser, 
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
