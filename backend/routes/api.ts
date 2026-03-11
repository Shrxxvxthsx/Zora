// API routes for video history
import express from "express";
import { getVideos, saveVideo, deleteVideo } from "../controllers/videoController";

const router = express.Router();

router.get("/videos", getVideos);
router.post("/videos", saveVideo);
router.delete("/videos/:id", deleteVideo);

export default router;
