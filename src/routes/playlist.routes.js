import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createPlaylist,toggleVideo,getAllPlaylistOfUser } from "../controllers/playlist.controller.js"

import { Router } from "express"

const router = Router()

router.route("/create-playlist").post(verifyJWT,createPlaylist)
router.route("/playlists/:playlistId/videos/:videoId").post(verifyJWT,toggleVideo)
router.route("/get-all-playlist/:userId").get(verifyJWT,getAllPlaylistOfUser)

export default router
