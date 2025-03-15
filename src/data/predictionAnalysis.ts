import { Prediction, PredictionCategory, SIPP } from './sippData';

// 1. PROCESS: PREDICTION PARSING & RETRIEVAL
// ------------------------------------------

/**
 * Parses a raw prediction from an external source into our application's format
 */
export const parsePrediction = (rawPrediction: any, sippName: string, index: number): Prediction => {
  const category = (rawPrediction.category || 'economy').replace('_', '-') as PredictionCategory;
  
  return {
    id: `pred-${sippName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    dateStated: rawPrediction.dateStated || new Date().toISOString().split('T')[0],
    predictedOutcome: rawPrediction.predictedOutcome || "No prediction text available",
    category: category,
    timeframe: rawPrediction.timeframe || "Not specified",
    verificationStatus: rawPrediction.verificationStatus || "pending",
    actualOutcome: rawPrediction.actualOutcome || undefined,
    accuracyRating: rawPrediction.accuracyRating || undefined,
    normalizedScore: rawPrediction.normalizedScore || undefined,
    analysisExplanation: rawPrediction.analysisExplanation || undefined
  };
};

// 2. PROCESS: PREDICTION ASSESSMENT
// ---------------------------------

/**
 * Category-specific variance thresholds for more accurate scoring
 * These represent typical margins of error for different types of predictions
 */
export const CATEGORY_VARIANCE: Record<PredictionCategory, {
  low: number,  // Low variance threshold
  high: number, // High variance threshold
  units: string // Unit of measurement (for context)
}> = {
  'economy': {
    low: 0.05,  // 5% variance is considered low for economic predictions
    high: 0.15, // 15% variance is considered high
    units: 'percent'
  },
  'politics': {
    low: 0.1,   // 10% variance for political outcomes (e.g., vote share)
    high: 0.2,  // 20% variance is high
    units: 'probability'
  },
  'technology': {
    low: 0.3,   // Technology predictions have higher inherent variance
    high: 0.5,  // 50% is considered high variance
    units: 'timeframe'
  },
  'foreign-policy': {
    low: 0.2,   // Foreign policy predictions have moderate-high variance
    high: 0.4,  // 40% variance is high
    units: 'likelihood'
  },
  'social-trends': {
    low: 0.25,  // Social trends have inherently high variance
    high: 0.45, // 45% variance is high
    units: 'magnitude'
  }
};

/**
 * Assesses a prediction against its actual outcome and assigns an accuracy rating
 * using more robust category-specific rules and variance considerations
 */
export const assessPrediction = (prediction: Prediction, actualOutcome: string): number => {
  // Base score starts at 2 (partially correct)
  let score = 2;
  
  // Extract key information from the prediction and actual outcome
  const predictionLower = prediction.predictedOutcome.toLowerCase();
  const actualLower = actualOutcome.toLowerCase();
  
  // Completely wrong prediction detection (generic across categories)
  if (
    (actualLower.includes("did not happen") || 
     actualLower.includes("completely incorrect") ||
     actualLower.includes("entirely wrong") ||
     actualLower.includes("opposite occurred")) &&
    !actualLower.includes("partially")
  ) {
    return 1; // Completely wrong
  }
  
  // Completely right prediction detection (generic across categories)
  if (
    (actualLower.includes("exactly as predicted") || 
     actualLower.includes("completely accurate") ||
     actualLower.includes("fully correct") ||
     actualLower.includes("precisely as forecasted")) &&
    !actualLower.includes("partially")
  ) {
    return 3; // Completely right
  }
  
  // Category-specific scoring with enhanced variance consideration
  switch(prediction.category) {
    case 'economy':
      // Economic predictions consider numerical precision and actual variance
      if (actualLower.includes("off by more than 10%") || 
          actualLower.includes("significantly overestimated") ||
          actualLower.includes("significantly underestimated") ||
          actualLower.includes("direction was wrong") ||
          actualLower.includes("missed by double digits")) {
        score = 1;
      } else if (
          // More precise threshold checks for economic predictions
          (actualLower.includes("within 5%") || 
           actualLower.includes("very accurate") ||
           actualLower.includes("closely predicted") ||
           actualLower.includes("margin of error") ||
           actualLower.includes("nearly exact")) &&
          !actualLower.includes("but timing was off")
      ) {
        score = 3;
      } else if (
          // Partial accuracy cases
          actualLower.includes("correct direction") ||
          actualLower.includes("partially accurate") ||
          actualLower.includes("somewhat correct") ||
          (actualLower.includes("right") && actualLower.includes("magnitude was off"))
      ) {
        score = 2;
      }
      break;
      
    case 'politics':
      // Political predictions focus on outcomes, timing, and magnitudes
      if (actualLower.includes("wrong outcome") || 
          actualLower.includes("incorrect winner") ||
          actualLower.includes("opposite happened") ||
          actualLower.includes("misread political trends") ||
          actualLower.includes("failed to anticipate")) {
        score = 1;
      } else if (
          // More nuanced checks for highly accurate political predictions
          (actualLower.includes("correct outcome") && 
           (actualLower.includes("timing was accurate") ||
            actualLower.includes("accurately predicted") ||
            actualLower.includes("correctly forecasted"))) ||
          (actualLower.includes("winner") && actualLower.includes("margin") && 
           actualLower.includes("accurately"))
      ) {
        score = 3;
      } else if (
          // Partial accuracy cases for politics
          actualLower.includes("correct party") ||
          actualLower.includes("right direction") ||
          (actualLower.includes("outcome") && actualLower.includes("timing was off")) ||
          actualLower.includes("partially correct")
      ) {
        score = 2;
      }
      break;
      
    case 'technology':
      // Technology predictions with more nuanced assessment considering adoption curves
      if (actualLower.includes("wrong direction") || 
          actualLower.includes("technology failed") ||
          actualLower.includes("never materialized") ||
          actualLower.includes("abandoned") ||
          actualLower.includes("opposite trend emerged")) {
        score = 1;
      } else if (
          // High accuracy for technology predictions considers both direction and adoption
          (actualLower.includes("correct direction") && 
           !actualLower.includes("timing was off") &&
           (actualLower.includes("adoption rate") || 
            actualLower.includes("market penetration") ||
            actualLower.includes("technological advancement")))
      ) {
        score = 3;
      } else if (
          // Partial accuracy for technology
          actualLower.includes("right technology") ||
          actualLower.includes("emerged as predicted") ||
          (actualLower.includes("correct") && actualLower.includes("timeline was off")) ||
          actualLower.includes("partially adopted")
      ) {
        score = 2;
      }
      break;
      
    case 'foreign-policy':
      // Foreign policy with enhanced consideration of actors and contexts
      if (actualLower.includes("completely misread") || 
          actualLower.includes("wrong actors") ||
          actualLower.includes("opposite response") ||
          actualLower.includes("fundamentally misunderstood") ||
          actualLower.includes("diplomatic failure")) {
        score = 1;
      } else if (
          // High accuracy for foreign policy considers multiple factors
          (actualLower.includes("correctly identified") && 
           actualLower.includes("accurate assessment")) ||
          (actualLower.includes("diplomatic") && 
           actualLower.includes("precisely") &&
           actualLower.includes("predicted"))
      ) {
        score = 3;
      } else if (
          // Partial accuracy for foreign policy
          actualLower.includes("general approach") ||
          actualLower.includes("correct countries") ||
          (actualLower.includes("right") && actualLower.includes("response")) ||
          actualLower.includes("partially accurate")
      ) {
        score = 2;
      }
      break;
      
    case 'social-trends':
      // Social trends with better distinction between direction and magnitude
      if (actualLower.includes("trend moved opposite") || 
          actualLower.includes("completely misread public sentiment") ||
          actualLower.includes("social movement collapsed") ||
          actualLower.includes("wrong demographic") ||
          actualLower.includes("cultural shift reversed")) {
        score = 1;
      } else if (
          // High accuracy for social trends focuses on both direction and magnitude
          (actualLower.includes("trend developed as predicted") && 
           !actualLower.includes("overestimated") &&
           !actualLower.includes("underestimated")) ||
          (actualLower.includes("social change") && 
           actualLower.includes("precisely") &&
           actualLower.includes("forecasted"))
      ) {
        score = 3;
      } else if (
          // Partial accuracy for social trends
          actualLower.includes("right direction") ||
          actualLower.includes("emerged but") ||
          (actualLower.includes("trend") && actualLower.includes("magnitude was different")) ||
          actualLower.includes("partially manifested")
      ) {
        score = 2;
      }
      break;
  }
  
  // Apply variance adjustment if specific variance information is present
  if (actualLower.includes("variance") || actualLower.includes("deviated by")) {
    // Extract variance percentage if present
    const varianceMatch = actualLower.match(/(?:variance|deviated by|off by) (\d+(?:\.\d+)?)%/);
    if (varianceMatch && varianceMatch[1]) {
      const variance = parseFloat(varianceMatch[1]) / 100;
      const categoryVariance = CATEGORY_VARIANCE[prediction.category];
      
      // Adjust score based on where the variance falls relative to category thresholds
      if (variance <= categoryVariance.low) {
        // If variance is within the low threshold, increase score (max 3)
        score = Math.min(score + 0.5, 3);
      } else if (variance >= categoryVariance.high) {
        // If variance exceeds high threshold, decrease score (min 1)
        score = Math.max(score - 0.5, 1);
      }
    }
  }
  
  // If prediction contains specific metrics or percentages
  const predictionContainsMetrics = predictionLower.match(/\b\d+(?:\.\d+)?%|\b\d+\s+percent\b/);
  const actualContainsMetrics = actualLower.match(/\b\d+(?:\.\d+)?%|\b\d+\s+percent\b/);
  
  // If both contain metrics, we can do a more precise comparison
  if (predictionContainsMetrics && actualContainsMetrics) {
    // Extract the predicted and actual percentages
    const predictedPercentMatch = predictionLower.match(/(\d+(?:\.\d+)?)%|(\d+)\s+percent/);
    const actualPercentMatch = actualLower.match(/(\d+(?:\.\d+)?)%|(\d+)\s+percent/);
    
    if (predictedPercentMatch && actualPercentMatch) {
      const predictedPercent = parseFloat(predictedPercentMatch[1] || predictedPercentMatch[2]);
      const actualPercent = parseFloat(actualPercentMatch[1] || actualPercentMatch[2]);
      
      // Calculate the absolute difference as a percentage of the actual
      const percentDiff = Math.abs(predictedPercent - actualPercent);
      const relativeDiff = actualPercent ? percentDiff / actualPercent : 1;
      
      // Adjust score based on relative difference
      if (relativeDiff <= CATEGORY_VARIANCE[prediction.category].low) {
        score = 3; // Very accurate
      } else if (relativeDiff >= CATEGORY_VARIANCE[prediction.category].high) {
        score = 1; // Very inaccurate
      } else {
        score = 2; // Moderately accurate
      }
    }
  }
  
  return score;
};

// 3. PROCESS: PREDICTION SCORING & NORMALIZATION
// ---------------------------------------------

/**
 * Category-specific difficulty factors for normalizing prediction scores
 */
export const CATEGORY_DIFFICULTY: Record<PredictionCategory, number> = {
  'economy': 0.9, // Economic predictions are harder (more precise data available)
  'politics': 0.8,
  'technology': 0.7, // Technology predictions are more difficult
  'foreign-policy': 0.75,
  'social-trends': 0.6 // Social trends are the most difficult to predict precisely
};

/**
 * Normalizes a raw accuracy score based on prediction category difficulty
 */
export const normalizePredictionScore = (rawScore: number, category: PredictionCategory): number => {
  const difficultyFactor = CATEGORY_DIFFICULTY[category] || 0.8;
  return parseFloat((rawScore * difficultyFactor).toFixed(2));
};

// 4. PROCESS: PATTERN ANALYSIS & BIAS DETECTION
// -------------------------------------------

export interface BiasPattern {
  type: string;
  description: string;
  frequency: number; // 0-1 representing percentage of predictions showing this bias
}

/**
 * Analyzes a set of predictions to identify bias patterns in a SIPP's predictions
 */
export const analyzePatterns = (predictions: Prediction[]): BiasPattern[] => {
  const verifiedPredictions = predictions.filter(p => 
    p.verificationStatus === 'verified' && typeof p.accuracyRating === 'number'
  );
  
  if (verifiedPredictions.length < 3) {
    return [];
  }
  
  const patterns: BiasPattern[] = [];
  const totalVerified = verifiedPredictions.length;
  
  // Check for optimism bias (consistently overestimating positive outcomes)
  const optimisticPredictions = verifiedPredictions.filter(p => 
    p.accuracyRating && p.accuracyRating < 2 && 
    p.predictedOutcome.toLowerCase().includes("increase") || 
    p.predictedOutcome.toLowerCase().includes("improve") ||
    p.predictedOutcome.toLowerCase().includes("success")
  );
  
  if (optimisticPredictions.length > 0) {
    patterns.push({
      type: "Optimism Bias",
      description: "Tendency to overestimate positive outcomes and underestimate challenges",
      frequency: parseFloat((optimisticPredictions.length / totalVerified).toFixed(2))
    });
  }
  
  // Check for pessimism bias (consistently overestimating negative outcomes)
  const pessimisticPredictions = verifiedPredictions.filter(p => 
    p.accuracyRating && p.accuracyRating < 2 && 
    p.predictedOutcome.toLowerCase().includes("decrease") || 
    p.predictedOutcome.toLowerCase().includes("decline") ||
    p.predictedOutcome.toLowerCase().includes("fail")
  );
  
  if (pessimisticPredictions.length > 0) {
    patterns.push({
      type: "Pessimism Bias",
      description: "Tendency to overestimate negative outcomes and underestimate opportunities",
      frequency: parseFloat((pessimisticPredictions.length / totalVerified).toFixed(2))
    });
  }
  
  // Check for timing issues (predictions that are directionally correct but off on timing)
  const timingIssuePredictions = verifiedPredictions.filter(p => 
    p.accuracyRating && p.accuracyRating === 2 && 
    (p.actualOutcome?.toLowerCase().includes("timing was off") ||
     p.actualOutcome?.toLowerCase().includes("happened later") ||
     p.actualOutcome?.toLowerCase().includes("happened earlier"))
  );
  
  if (timingIssuePredictions.length > 0) {
    patterns.push({
      type: "Timing Misjudgment",
      description: "Correctly predicts outcomes but consistently misjudges timing",
      frequency: parseFloat((timingIssuePredictions.length / totalVerified).toFixed(2))
    });
  }
  
  // Check for category-specific patterns
  const categoryCounters: Record<PredictionCategory, number> = {
    'economy': 0,
    'politics': 0,
    'technology': 0,
    'foreign-policy': 0,
    'social-trends': 0
  };
  
  const categoryAccuracySums: Record<PredictionCategory, number> = {
    'economy': 0,
    'politics': 0,
    'technology': 0,
    'foreign-policy': 0,
    'social-trends': 0
  };
  
  // Count predictions and sum accuracies by category
  verifiedPredictions.forEach(p => {
    if (p.accuracyRating) {
      categoryCounters[p.category] = (categoryCounters[p.category] || 0) + 1;
      categoryAccuracySums[p.category] = (categoryAccuracySums[p.category] || 0) + p.accuracyRating;
    }
  });
  
  // Find best and worst categories
  let bestCategory: PredictionCategory | null = null;
  let worstCategory: PredictionCategory | null = null;
  let bestAverage = 0;
  let worstAverage = 3;
  
  Object.keys(categoryCounters).forEach(cat => {
    const category = cat as PredictionCategory;
    const count = categoryCounters[category];
    
    if (count >= 2) { // Only consider categories with at least 2 predictions
      const average = categoryAccuracySums[category] / count;
      
      if (average > bestAverage) {
        bestAverage = average;
        bestCategory = category;
      }
      
      if (average < worstAverage) {
        worstAverage = average;
        worstCategory = category;
      }
    }
  });
  
  if (bestCategory) {
    patterns.push({
      type: "Strength",
      description: `Demonstrates highest prediction accuracy in ${bestCategory.replace('-', ' ')} topics`,
      frequency: parseFloat((categoryCounters[bestCategory] / totalVerified).toFixed(2))
    });
  }
  
  if (worstCategory) {
    patterns.push({
      type: "Weakness",
      description: `Demonstrates lowest prediction accuracy in ${worstCategory.replace('-', ' ')} topics`,
      frequency: parseFloat((categoryCounters[worstCategory] / totalVerified).toFixed(2))
    });
  }
  
  return patterns;
};

/**
 * Generates an explanation for why a prediction was inaccurate
 */
export const explainPredictionError = (prediction: Prediction): string => {
  if (!prediction.actualOutcome || prediction.accuracyRating === undefined || prediction.accuracyRating >= 2.5) {
    return ""; // No explanation needed for accurate predictions
  }
  
  const basePhrases = [
    "This prediction was inaccurate because ",
    "The forecaster misjudged ",
    "The analysis failed to account for ",
    "The prediction overlooked "
  ];
  
  const categorySpecificExplanations = {
    'economy': [
      "the impact of monetary policy changes.",
      "underlying inflationary pressures.",
      "shifts in consumer spending habits.",
      "supply chain disruptions.",
      "market sentiment shifts."
    ],
    'politics': [
      "changing voter demographics.",
      "the influence of late-breaking events.",
      "the effectiveness of campaign messaging.",
      "shifts in party alignment.",
      "the impact of candidate controversies."
    ],
    'technology': [
      "technical implementation challenges.",
      "user adoption barriers.",
      "competing technology developments.",
      "regulatory hurdles.",
      "funding and investment patterns."
    ],
    'foreign-policy': [
      "internal political pressures in key countries.",
      "changing geopolitical alignments.",
      "economic incentives that altered diplomatic positions.",
      "communication breakdowns between nations.",
      "the influence of non-state actors."
    ],
    'social-trends': [
      "resistance to change in established behaviors.",
      "the pace of attitude shifts in different demographics.",
      "the influence of major external events.",
      "counter-movements that emerged in response.",
      "regional variations in cultural attitudes."
    ]
  };
  
  const basePhrase = basePhrases[Math.floor(Math.random() * basePhrases.length)];
  const categoryExplanations = categorySpecificExplanations[prediction.category];
  const specificExplanation = categoryExplanations[Math.floor(Math.random() * categoryExplanations.length)];
  
  return basePhrase + specificExplanation;
};

// 5. AGGREGATE FUNCTIONS FOR SIPP ANALYSIS
// ---------------------------------------

/**
 * Calculates overall accuracy metrics for a SIPP based on their verified predictions
 */
export const calculateSippAccuracy = (predictions: Prediction[]): {
  averageAccuracy: number,
  categoryAccuracy: Record<string, number>,
  patterns: BiasPattern[],
  strongestCategory: PredictionCategory | null,
  weakestCategory: PredictionCategory | null
} => {
  const verifiedPredictions = predictions.filter(p => 
    p.verificationStatus === 'verified' && typeof p.accuracyRating === 'number' && !isNaN(p.accuracyRating)
  );
  
  console.log(`[DEBUG] calculateSippAccuracy: Processing ${verifiedPredictions.length} verified predictions`);
  
  // If we have no verified predictions at all, return defaults but log this situation
  if (verifiedPredictions.length === 0) {
    console.log('[DEBUG] calculateSippAccuracy: No verified predictions, returning default scores');
    return {
      averageAccuracy: 2.0,
      categoryAccuracy: {
        economy: 2.0,
        politics: 2.0,
        technology: 2.0,
        foreign_policy: 2.0,
        social_trends: 2.0
      },
      patterns: [],
      strongestCategory: null,
      weakestCategory: null
    };
  }
  
  // Calculate overall average with better logging
  const totalAccuracy = verifiedPredictions.reduce((sum, p) => {
    if (typeof p.accuracyRating !== 'number' || isNaN(p.accuracyRating)) {
      console.warn(`[DEBUG] Invalid accuracy rating for prediction: ${p.id}`);
      return sum;
    }
    console.log(`[DEBUG] Prediction score: ${p.accuracyRating}`);
    return sum + p.accuracyRating;
  }, 0);
  
  const averageAccuracy = parseFloat((totalAccuracy / verifiedPredictions.length).toFixed(2));
  console.log(`[DEBUG] Overall average accuracy: ${averageAccuracy} (Total: ${totalAccuracy} / Count: ${verifiedPredictions.length})`);
  
  // Initialize category arrays
  const categories = {
    economy: [] as number[],
    politics: [] as number[],
    technology: [] as number[],
    foreign_policy: [] as number[],
    social_trends: [] as number[]
  };
  
  // Group predictions by category
  verifiedPredictions.forEach(p => {
    if (typeof p.accuracyRating === 'number' && !isNaN(p.accuracyRating)) {
      const categoryKey = p.category.replace('-', '_') as keyof typeof categories;
      if (categories[categoryKey]) {
        categories[categoryKey].push(p.accuracyRating);
      }
    }
  });
  
  const categoryAccuracy: Record<string, number> = {};
  let strongestCategory: PredictionCategory | null = null;
  let weakestCategory: PredictionCategory | null = null;
  let highestAccuracy = 0;
  let lowestAccuracy = 3;
  
  // Calculate category averages and find strongest/weakest
  Object.keys(categories).forEach(cat => {
    const scores = categories[cat as keyof typeof categories];
    console.log(`[DEBUG] Category ${cat} has ${scores.length} predictions with scores: ${JSON.stringify(scores)}`);
    
    if (scores.length > 0) {
      const sum = scores.reduce((a, b) => a + b, 0);
      const average = parseFloat((sum / scores.length).toFixed(2));
      categoryAccuracy[cat] = average;
      
      console.log(`[DEBUG] Category ${cat} average: ${average} (Sum: ${sum} / Count: ${scores.length})`);
      
      // Track strongest and weakest categories
      if (average > highestAccuracy) {
        highestAccuracy = average;
        strongestCategory = cat.replace('_', '-') as PredictionCategory;
      }
      
      if (average < lowestAccuracy) {
        lowestAccuracy = average;
        weakestCategory = cat.replace('_', '-') as PredictionCategory;
      }
    } else {
      // No predictions in this category - use overall average instead of defaulting to 2.0
      categoryAccuracy[cat] = averageAccuracy;
      console.log(`[DEBUG] Category ${cat} has no predictions, using overall average: ${averageAccuracy}`);
    }
  });
  
  // Analyze patterns
  const patterns = analyzePatterns(predictions);
  
  return {
    averageAccuracy,
    categoryAccuracy,
    patterns,
    strongestCategory,
    weakestCategory
  };
};

/**
 * Generates a comprehensive analysis of a SIPP's prediction patterns
 */
export const generateSippAnalysis = (sipp: SIPP): string => {
  const {
    averageAccuracy,
    categoryAccuracy,
    patterns,
    strongestCategory,
    weakestCategory
  } = calculateSippAccuracy(sipp.predictions);
  
  let analysis = `${sipp.name}'s prediction accuracy averages ${averageAccuracy.toFixed(1)} on a scale of 1-3. `;
  
  if (strongestCategory) {
    analysis += `Their strongest category is ${strongestCategory.replace('-', ' ')}, where they achieve an accuracy of ${categoryAccuracy[strongestCategory.replace('-', '_')].toFixed(1)}. `;
  }
  
  if (weakestCategory) {
    analysis += `Their weakest category is ${weakestCategory.replace('-', ' ')}, with an accuracy of ${categoryAccuracy[weakestCategory.replace('-', '_')].toFixed(1)}. `;
  }
  
  if (patterns.length > 0) {
    analysis += `Analysis reveals several prediction patterns: `;
    
    patterns.slice(0, 3).forEach((pattern, index) => {
      if (index > 0) {
        analysis += '; ';
      }
      analysis += `${pattern.type.toLowerCase()} (${pattern.description.toLowerCase()})`;
    });
    
    analysis += '.';
  }
  
  return analysis;
}; 