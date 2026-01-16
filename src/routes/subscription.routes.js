import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addSubscriber,getAllSubscriber,removeSubscriber } from "../controllers/subscription.controller.js"
import { Router } from "express"

const router = Router()

router.route("/channel/:channelId").post(verifyJWT,addSubscriber)
router.route("/get-subscriber/:channelId").get(verifyJWT,getAllSubscriber)
router.route("/unsubscribe/:channelId").get(verifyJWT,removeSubscriber)

export default router