/**
 * Calculate account indicators from raw data
 * @param {Object} accountData - Raw account information
 * @returns {Object} Calculated indicators
 */
export function calculateAccountIndicators(accountData) {
  const {
    followers = 0,
    following = 0,
    posts = 0,
    accountAgeDays = 0,
  } = accountData;

  const postingFrequency = accountAgeDays > 0 ? posts / accountAgeDays : posts;

  const engagementRatio = following > 0 ? followers / following : 0;

  const followingFollowerRatio =
    followers > 0 ? following / followers : following;

  return {
    followers,
    following,
    posts,
    accountAgeDays,
    postingFrequency: parseFloat(postingFrequency.toFixed(2)),
    engagementRatio: parseFloat(engagementRatio.toFixed(3)),
    followingFollowerRatio: parseFloat(followingFollowerRatio.toFixed(3)),
  };
}

/**
 * Generate rule-based bot score (0-100)
 * Combines multiple factors into a single suspicious score
 * @param {Object} indicators - Account indicators
 * @returns {number} Bot score 0-100
 */
export function generateRuleBasedScore(indicators) {
  let score = 0;

  // Account age factor (20 points max)
  if (indicators.accountAgeDays < 7) {
    score += 20; // Brand new account
  } else if (indicators.accountAgeDays < 30) {
    score += 15; // Very young
  } else if (indicators.accountAgeDays < 90) {
    score += 8; // Young
  } else if (indicators.accountAgeDays < 365) {
    score += 3; // Less than a year
  }

  // Follower count factor (20 points max)
  if (indicators.followers < 10) {
    score += 20; // Almost no followers
  } else if (indicators.followers < 50) {
    score += 15; // Very few followers
  } else if (indicators.followers < 200) {
    score += 8; // Low followers
  } else if (indicators.followers < 1000) {
    score += 3; // Modest followers
  }

  // Posting frequency factor (25 points max)
  if (indicators.postingFrequency > 20) {
    score += 25; // Extremely high frequency
  } else if (indicators.postingFrequency > 10) {
    score += 18; // Very high frequency
  } else if (indicators.postingFrequency > 5) {
    score += 10; // High frequency
  } else if (indicators.postingFrequency > 2) {
    score += 4; // Moderate frequency
  }

  // Engagement ratio factor (20 points max) --> jaga2 klo ada bot yang beli followers
  if (indicators.engagementRatio < 0.05) {
    score += 20; // Virtually no engagement
  } else if (indicators.engagementRatio < 0.1) {
    score += 15; // Very low engagement
  } else if (indicators.engagementRatio < 0.2) {
    score += 8; // Low engagement
  } else if (indicators.engagementRatio < 0.5) {
    score += 3; // Moderate engagement
  }

  // Following/Followers ratio factor (15 points max)
  if (indicators.followingFollowerRatio > 5) {
    score += 15; // Following 5x more than followers
  } else if (indicators.followingFollowerRatio > 3) {
    score += 10; // Following 3x more than followers
  } else if (indicators.followingFollowerRatio > 1.5) {
    score += 5; // Following more than followers
  }

  // Cap score at 100
  return Math.min(score, 100);
}

/**
 * Validate account data input
 * @param {Object} data - Account data to validate
 * @throws {ValidationError} If data is invalid
 */
export function validateAccountData(data) {
  const errors = [];

  if (!data.username || typeof data.username !== "string") {
    errors.push("username must be a non-empty string");
  }

  if (typeof data.followers !== "number" || data.followers < 0) {
    errors.push("followers must be a non-negative number");
  }

  if (typeof data.following !== "number" || data.following < 0) {
    errors.push("following must be a non-negative number");
  }

  if (typeof data.posts !== "number" || data.posts < 0) {
    errors.push("posts must be a non-negative number");
  }

  if (typeof data.accountAgeDays !== "number" || data.accountAgeDays < 0) {
    errors.push("accountAgeDays must be a non-negative number");
  }

  if (errors.length > 0) {
    const error = new Error("Validation failed");
    error.name = "ValidationError";
    error.statusCode = 400;
    error.details = errors;
    throw error;
  }
}
