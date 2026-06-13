/**
 * Backend API Service - Terhubung ke backend Node.js
 */

// URL backend - sesuaikan dengan environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

console.log("🔧 Backend URL:", BACKEND_URL);

/**
 * Analyze account untuk deteksi bot
 * @param {Object} data - Data account yang akan dianalisis
 * @returns {Promise<Object>} Hasil analisis dengan bot score
 */
export async function analyzeAccount(data) {
  try {
    console.log("📤 Mengirim data ke backend:", data);

    const response = await fetch(`${BACKEND_URL}/api/account/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Backend error: ${response.status}`);
    }

    const result = await response.json();

    console.log("✅ Response dari backend:", result);

    return {
      success: true,
      score: result.data.botScore,
      riskLevel: result.data.riskLevel,
      indicators: result.data.indicators,
      reasons: result.data.reasons,
      analysisId: result.data.analysisId,
      timestamp: result.data.timestamp,
    };
  } catch (error) {
    console.error("❌ Error analyzing account:", error);
    return {
      success: false,
      error: error.message || "Gagal terhubung ke backend",
      score: 0,
      riskLevel: "UNKNOWN",
      reasons: [
        "Tidak bisa terhubung ke server - periksa apakah backend sedang berjalan",
      ],
    };
  }
}

/**
 * Get history analisis untuk user tertentu
 * @param {string} username - Username yang dicari
 * @returns {Promise<Object>} Data history atau null
 */
export async function getAnalysisHistory(username) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/account/${username}/history`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 404) {
      return {
        success: true,
        data: null,
        message: "Belum ada history untuk user ini",
      };
    }

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("❌ Error getting history:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check apakah backend online
 * @returns {Promise<boolean>} true jika backend responsif
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
    });
    const isHealthy = response.ok;
    console.log(
      "🏥 Backend health check:",
      isHealthy ? "✅ Online" : "❌ Offline",
    );
    return isHealthy;
  } catch (error) {
    console.error("❌ Backend not available:", error.message);
    return false;
  }
}
