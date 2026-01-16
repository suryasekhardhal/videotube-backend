import { Router } from "express";
import { addComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
/**
 * TEST ROUTE (always keep this while debugging)
 */
router.get("/test", (req, res) => {
  res.json({ message: "comment routes working ✅" });
});


router.route("/add-comment/:videoId").post(verifyJWT,addComment)

export default router