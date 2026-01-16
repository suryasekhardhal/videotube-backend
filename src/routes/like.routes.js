import {verifyJWT} from "../middlewares/auth.middleware.js"
import { like,getAllLike } from "../controllers/like.controller.js"

import { Router } from "express"

const router = Router()

router.route("/like/:type/:id").post(verifyJWT,like)
router.route("/get-all-like/:type/:id").get(verifyJWT,getAllLike)

export default router