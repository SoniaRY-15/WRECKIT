export async function analyzeAccount(data) {

    return {
        score: 84,
        status: "High Risk",
        confidence: 92
    };

}

const result = await analyzeAccount(userData);