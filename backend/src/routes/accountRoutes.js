import express from "express";
import {
  analyzeAccount,
  getAnalysisHistory,
} from "../controllers/accountController.js";

const router = express.Router();

// POST /api/account/analyze - Analyze an account
router.post("/analyze", analyzeAccount);

// GET /api/account/:username/history - Get analysis history
router.get("/:username/history", getAnalysisHistory);

export default router;
