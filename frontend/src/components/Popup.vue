<script setup>
import { ref } from "vue";

const result = ref(null);

function analyze() {
    result.value = {
        score: 82,
        risk: "High",
        confidence: 82,
        indicators: [
        "Repetitive content",
        "High posting frequency"
        ]
    };
    }
    </script>

    <template>
    <div class="popup">

        <div class="header">
            <h2>🛡️ Buzzer Detector</h2>
            <p>Analyze social media credibility</p>
        </div>

        <div class="card">
            <small>Current Page</small>
            <p>https://example.com</p>
        </div>

        <button @click="analyze">
            Analyze Now
        </button>

        <div v-if="result" class="result">
            <h3>Risk Score</h3>
            <div class="score">
                <span>{{ result.score }}%</span>
                <span
                class="badge"
                :class="result.risk.toLowerCase()"
                >
                {{ result.risk }}
                </span>
            </div>

            <div class="progress">
                <div class="fill" :style="{ width: result.confidence + '%' }"></div>
            </div>

            <div class="indicator">
                <h4>Indicators</h4>
                <ul>
                <li
                    v-for="item in result.indicators"
                    :key="item">
                    {{ item }}
                </li>
                </ul>
            </div>
        </div>
    </div>
</template>