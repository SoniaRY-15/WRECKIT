import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_PATH = path.join(__dirname, "../../models/buzzer_model.pkl");

class ModelService {
  constructor() {
    this.pythonScript = `
import pickle
import sys
import json

def analyze(model_path, features):
    with open(model_path, 'rb') as f:
        saved = pickle.load(f)
    
    model = saved['model']
    
    # Predict
    prediction = model.predict([features])[0]
    proba = model.predict_proba([features])[0]
    
    # Bot score = probabilitas dari class 1 (suspicious) + class 2 (buzzer)
    bot_score = int((proba[1] + proba[2]) * 100)
    
    result = {
        "aiScore": bot_score,
        "prediction": int(prediction),
        "probabilities": [float(p) for p in proba],
        "confidence": float(proba[int(prediction)]) * 100
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    model_path = sys.argv[1]
    features = json.loads(sys.argv[2])
    analyze(model_path, features)
`;
  }

  /**
   * Analyze account menggunakan local Buzzer Model
   * @param {Object} accountData - Account metrics
   * @returns {Promise<Object>} AI analysis result
   */
  async analyzeAccount(accountData) {
    return new Promise((resolve, reject) => {
      try {
        // Check kalau model file exist
        if (!fs.existsSync(MODEL_PATH)) {
          console.warn(`⚠️  Model file not found at ${MODEL_PATH}`);
          return resolve({
            aiScore: null,
            riskLevel: "UNKNOWN",
            explanation: [
              "Model file not available - using rule-based analysis only",
            ],
            error: "Model not found",
          });
        }

        console.log(`🤖 Analyzing with local Buzzer Model...`);

        // Prepare features dalam urutan yang sama dengan training
        const ff_ratio =
          accountData.followers > 0
            ? accountData.following / accountData.followers
            : 0;

        const tweets_per_day =
          accountData.accountAgeDays > 0
            ? accountData.posts / accountData.accountAgeDays
            : accountData.posts;

        const features = [
          accountData.followers, // followers_count
          accountData.following, // friends_count
          accountData.posts, // statuses_count
          0, // listed_count (default 0)
          accountData.accountAgeDays, // account_age_days
          ff_ratio, // ff_ratio
          tweets_per_day, // tweets_per_day
          accountData.hasDescription ? 1 : 0, // has_description
          accountData.verified ? 1 : 0, // verified_int
          accountData.accountAgeDays < 730 ? 1 : 0, // is_new_account
          accountData.followers < 500 ? 1 : 0, // low_followers
          ff_ratio > 3 ? 1 : 0, // high_ff_ratio
          1, // no_listed (default 1)
        ];

        // Call Python script
        const python = spawn("python", [
          "-c",
          this.pythonScript,
          MODEL_PATH,
          JSON.stringify(features),
        ]);

        let output = "";
        let errorOutput = "";

        python.stdout.on("data", (data) => {
          output += data.toString();
        });

        python.stderr.on("data", (data) => {
          errorOutput += data.toString();
        });

        python.on("close", (code) => {
          if (code === 0 && output) {
            try {
              const result = JSON.parse(output);
              console.log(
                `✅ Model prediction complete. Score: ${result.aiScore}`,
              );

              // Convert prediction to risk level
              let riskLevel = "LOW";
              if (result.aiScore >= 80) riskLevel = "CRITICAL";
              else if (result.aiScore >= 60) riskLevel = "HIGH";
              else if (result.aiScore >= 40) riskLevel = "MEDIUM";

              // Convert prediction class to readable label
              const predictionLabels = ["normal", "suspicious", "buzzer"];
              const predictionLabel =
                predictionLabels[result.prediction] || "unknown";

              resolve({
                aiScore: result.aiScore,
                riskLevel: riskLevel,
                explanation: [
                  `Local model prediction: ${predictionLabel.toUpperCase()}`,
                  `Confidence: ${result.confidence.toFixed(1)}%`,
                  `Bot Score: ${result.aiScore}%`,
                ],
                rawResponse: result,
              });
            } catch (parseError) {
              console.error("Failed to parse model output:", parseError);
              resolve({
                aiScore: null,
                riskLevel: "UNKNOWN",
                explanation: ["Model output parsing failed"],
                error: "Parse error",
              });
            }
          } else {
            console.error(
              `❌ Model prediction failed:`,
              errorOutput || `Exit code: ${code}`,
            );
            resolve({
              aiScore: null,
              riskLevel: "UNKNOWN",
              explanation: [
                "Model prediction failed - using rule-based analysis only",
              ],
              error: "Model execution failed",
            });
          }
        });

        python.on("error", (err) => {
          console.error("Python spawn error:", err);
          resolve({
            aiScore: null,
            riskLevel: "UNKNOWN",
            explanation: [
              "Python not available - using rule-based analysis only",
            ],
            error: "Python not found",
          });
        });
      } catch (error) {
        console.error("Model service error:", error);
        resolve({
          aiScore: null,
          riskLevel: "UNKNOWN",
          explanation: ["Model service error - using rule-based analysis only"],
          error: error.message,
        });
      }
    });
  }

  /**
   * Health check untuk local model
   */
  async healthCheck() {
    const exists = fs.existsSync(MODEL_PATH);
    return {
      status: exists ? "ready" : "not_found",
      modelPath: MODEL_PATH,
      modelExists: exists,
    };
  }
}

export default new ModelService();
