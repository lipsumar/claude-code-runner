import { Router } from "express";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.send({ status: "ok" });
});

export default router;