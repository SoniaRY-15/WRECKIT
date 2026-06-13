import { asyncHandler } from "../middleware/errorHandler.js";
import analysisService from "../services/analysisService.js";
import { validateAccountData } from "../utils/scoreCalculator.js";

export const analyzeAccount = asyncHandler(async (req, res) => {
  // Validate input
  validateAccountData(req.body);

  // Call analysis service
  const result = await analysisService.analyzeAccount(req.body);

  // Return success response
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getAnalysisHistory = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username || typeof username !== "string") {
    return res.status(400).json({
      error: "Invalid username",
      message: "Username must be a non-empty string",
    });
  }

  const analysis = await analysisService.getAnalysisHistory(username);

  if (!analysis) {
    return res.status(404).json({
      error: "Not found",
      message: `No analysis found for username: ${username}`,
    });
  }

  res.status(200).json({
    success: true,
    data: analysis,
  });
});
