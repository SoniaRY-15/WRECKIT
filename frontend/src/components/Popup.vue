<script setup>
import { ref, onMounted } from "vue";
import { analyzeAccount, checkBackendHealth } from "../services/api.js";

const result = ref(null);
const loading = ref(false);
const error = ref(null);
const backendOnline = ref(false);

// Cek backend saat popup pertama kali dibuka
onMounted(async () => {
  backendOnline.value = await checkBackendHealth();
});

async function analyze() {
  loading.value = true;
  error.value = null;
  result.value = null;

  const accountData = {
    username: "testuser123",
    followers: 1500,
    following: 800,
    posts: 450,
    accountAgeDays: 365,
    hasDescription: true,
    verified: false,
  };

  // Panggil backend API (bukan mock data lagi)
  const response = await analyzeAccount(accountData);

  if (response.success) {
    result.value = {
      score: response.score,
      risk: response.riskLevel,
      confidence: Math.round((response.score / 100) * 100),
      indicators: response.reasons,
    };
  } else {
    error.value = response.error || "Analisis gagal";
  }

  loading.value = false;
}
</script>

<template>
  <div class="popup">
    <div class="header">
      <h2>🛡️ TrustLens</h2>
      <p>Analyze social media credibility</p>
      <!-- Tampilkan warning jika backend offline -->
      <div v-if="!backendOnline" class="warning">⚠️ Backend offline</div>
    </div>

    <div class="card">
      <small>Current Page</small>
      <p>https://example.com</p>
    </div>

    <!-- Disable button jika loading atau backend offline -->
    <button @click="analyze" :disabled="loading || !backendOnline">
      {{ loading ? "Analyzing..." : "Analyze Now" }}
    </button>

    <!-- Tampilkan error jika ada -->
    <div v-if="error" class="error-message">❌ {{ error }}</div>

    <!-- Tampilkan hasil jika ada -->
    <div v-if="result" class="result">
      <h3>Risk Score</h3>
      <div class="score">
        <span>{{ result.score }}%</span>
        <span class="badge" :class="result.risk.toLowerCase()">
          {{ result.risk }}
        </span>
      </div>

      <div class="progress">
        <div class="fill" :style="{ width: result.confidence + '%' }"></div>
      </div>

      <div class="indicator">
        <h4>Indicators</h4>
        <ul>
          <li v-for="item in result.indicators" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.warning {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 12px;
  color: #92400e;
}

.error-message {
  background: #fee2e2;
  border-left: 4px solid #ef4444;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 12px;
  color: #dc2626;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
