import {Playlist} from "../models/playlist.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"

const createPlaylist = asyncHandler(async(req,res)=>{
    //
    // const {videoId} = req.params
    // if (!videoId) {
    //     throw new ApiError(400,"video id required")
    // }
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400,"user id not found")
    }
    const {name,description} = req.body

    if (!name || !description) {
        throw new ApiError(400,"name and description required")
    }

    const playlist = await Playlist.create({
        name:name,
        description:description,
        owner:userId
    })

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"playlist created successfully"))




})

const toggleVideo = asyncHandler(async(req,res)=>{
    const {playlistId,videoId} = req.params
    const userId  = req.user?._id

    if (!videoId || !playlistId) {
        throw new ApiError(400,"video id and playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(400,"playlist not find")
    }
    
    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(401,"you can't modify this playlist")
    }

    const isVideoExists = playlist.video.includes(videoId)
    
    if (isVideoExists) {
        playlist.video.pull(videoId)
        await playlist.save()
        return res
        .status(200)
        .json(new ApiResponse(200, {added:false}, "video delete from playlist"))



    }

   

    playlist.video.push(videoId)

    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200,{added:true},"video added successfully"))



    
})

const getAllPlaylistOfUser = asyncHandler(async(req,res)=>{
    const {userId} = req.params

    if (!userId) {
        throw new ApiError(400,"user id required")
    }

    const playlist = await Playlist.find({owner:userId})
    .sort({createdAt:-1})

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Your All playlist"))

})

export {createPlaylist,toggleVideo,getAllPlaylistOfUser}