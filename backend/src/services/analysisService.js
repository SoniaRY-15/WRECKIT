import prisma from "../config/database.js";
import modelService from "./modelService.js";
import {
  calculateAccountIndicators,
  generateRuleBasedScore,
} from "../utils/scoreCalculator.js";

class AnalysisService {
  /**
   * Analyze an account for bot/propaganda behavior
   * @param {Object} accountData - Account information from request
   * @returns {Promise<Object>} Complete analysis with combined scores
   */
  async analyzeAccount(accountData) {
    console.log(`\n🔍 Starting analysis for account: ${accountData.username}`);

    // Step 1: Hitung indikator dan rule-based score dulu, biar ada hasil walaupun model belum siap
    console.log("Calculating rule-based indicators...");
    const indicators = calculateAccountIndicators(accountData);
    const ruleBasedScore = generateRuleBasedScore(indicators);
    const ruleBasedReasons = this.generateReasons(indicators, ruleBasedScore);

    console.log(`   Rule-based score: ${ruleBasedScore}`);

    // Step 2: Panggil local Buzzer Model untuk analisis lebih dalam
    console.log("Calling local Buzzer Model...");
    const aiResult = await modelService.analyzeAccount(accountData);

    // Step 3: Gabungkan hasil rule-based dan local model
    let finalScore = ruleBasedScore;
    let finalRiskLevel = this.scoreToRiskLevel(ruleBasedScore);
    let finalReasons = ruleBasedReasons;

    if (aiResult.aiScore !== null) {
      // Model ada - combine scores (40% rule-based + 60% model)
      finalScore = Math.round(ruleBasedScore * 0.4 + aiResult.aiScore * 0.6);
      finalRiskLevel = this.scoreToRiskLevel(finalScore);
      // Add model explanation to reasons
      finalReasons = [...ruleBasedReasons, ...aiResult.explanation];
    } else {
      // Model tidak tersedia - pakai rule-based aja
      console.log("⚠️  Model not available. Using rule-based analysis only.");
      finalScore = ruleBasedScore;
      finalReasons.push(
        "💡 AI model not available - using rule-based scoring only",
      );
    }

    console.log(`Final bot score: ${finalScore} (${finalRiskLevel})`);

    // Step 4: Store analysis in database
    console.log("Storing analysis results...");
    const analysis = await prisma.analysis.upsert({
      where: { username: accountData.username },
      update: {
        botScore: finalScore,
        riskLevel: finalRiskLevel,
        indicators: indicators,
        reasons: finalReasons,
        aiResponse: aiResult.rawResponse || null,
      },
      create: {
        username: accountData.username,
        botScore: finalScore,
        riskLevel: finalRiskLevel,
        indicators: indicators,
        reasons: finalReasons,
        aiResponse: aiResult.rawResponse || null,
      },
    });

    return {
      botScore: finalScore,
      riskLevel: finalRiskLevel,
      indicators,
      reasons: finalReasons,
      analysisId: analysis.id,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Convert numeric score to risk level
   * @param {number} score - Bot score (0-100)
   * @returns {string} Risk level
   */
  scoreToRiskLevel(score) {
    if (score >= 80) return "CRITICAL";
    if (score >= 60) return "HIGH";
    if (score >= 40) return "MEDIUM";
    return "LOW";
  }

  /**
   * Generate human-readable reasons for the score
   * @param {Object} indicators - Account indicators
   * @param {number} score - Bot score
   * @returns {Array<string>} Array of reasons
   */
  generateReasons(indicators, score) {
    const reasons = [];

    // Account age reasons
    if (indicators.accountAgeDays < 30) {
      reasons.push("🔴 Very young account (less than 30 days)");
    } else if (indicators.accountAgeDays < 90) {
      reasons.push("🟡 Young account (less than 90 days)");
    }

    // Follower reasons
    if (indicators.followers < 50) {
      reasons.push("🔴 Low follower count");
    }

    // Posting frequency reasons
    if (indicators.postingFrequency > 20) {
      reasons.push("🔴 Unusually high posting frequency");
    } else if (indicators.postingFrequency > 10) {
      reasons.push("🟡 High posting frequency");
    }

    // Engagement ratio reasons
    if (indicators.engagementRatio < 0.1) {
      reasons.push("🔴 Very low engagement ratio");
    }

    return reasons.length > 0 ? reasons : ["🟢 Account appears legitimate"];
  }

  /**
   * Get analysis history for a user
   * @param {string} username - Username to look up
   * @returns {Promise<Object|null>} Analysis record or null
   */
  async getAnalysisHistory(username) {
    return prisma.analysis.findUnique({
      where: { username },
    });
  }
}

export default new AnalysisService();
