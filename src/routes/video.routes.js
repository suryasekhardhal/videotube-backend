import { Router } from "express";
import { uploadVideo, getAllMyVideo, watchVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();




/**
 * TEST ROUTE (always keep this while debugging)
 */
router.get("/test", (req, res) => {
  res.json({ message: "Video routes working ✅" });
});



/**
 * UPLOAD VIDEO
 * POST /api/videos/upload
 */


router.route("/upload").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  uploadVideo
);

/**
 * GET ALL MY VIDEOS
 * GET /api/videos/my?page=1&limit=10
 */
router.route("/get-allMy-Video").get(
  verifyJWT,
  getAllMyVideo
);

/**
 * WATCH VIDEO (INCREASE VIEWS)
 * GET /api/videos/watch/:videoId
 */
router.route("/watch/:videoId").get(
  verifyJWT,
  watchVideo
);

export default router;
