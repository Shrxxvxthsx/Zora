// Controller logic for video history
import { Request, Response } from "express";

// In-memory storage for video history
let videoHistory: any[] = [];

export const getVideos = (req: Request, res: Response) => {
  res.json(videoHistory);
};

export const saveVideo = (req: Request, res: Response) => {
  const video = req.body;
  if (!video.id) {
    video.id = Math.random().toString(36).substr(2, 9);
  }
  if (!video.timestamp) {
    video.timestamp = Date.now();
  }
  
  // Check if it already exists (idempotency)
  const exists = videoHistory.find(v => v.id === video.id);
  if (!exists) {
    videoHistory.unshift(video); // Add to start
  }
  
  res.status(201).json(video);
};

export const deleteVideo = (req: Request, res: Response) => {
  const { id } = req.params;
  videoHistory = videoHistory.filter(v => v.id !== id);
  res.status(204).send();
};
