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
 * Assesses a prediction against its actual outcome and assigns an accuracy rating
 */
export const assessPrediction = (prediction: Prediction, actualOutcome: string): number => {
  // Base score starts at 2 (partially correct)
  let score = 2;
  
  // Extract key information from the prediction and actual outcome
  const predictionLower = prediction.predictedOutcome.toLowerCase();
  const actualLower = actualOutcome.toLowerCase();
  
  // Check if prediction was completely wrong
  if (
    (actualLower.includes("did not happen") || 
     actualLower.includes("completely incorrect") ||
     actualLower.includes("entirely wrong")) &&
    !actualLower.includes("partially")
  ) {
    return 1; // Completely wrong
  }
  
  // Check if prediction was completely right
  if (
    (actualLower.includes("exactly as predicted") || 
     actualLower.includes("completely accurate") ||
     actualLower.includes("fully correct")) &&
    !actualLower.includes("partially")
  ) {
    return 3; // Completely right
  }
  
  // Category-specific scoring
  switch(prediction.category) {
    case 'economy':
      // Economic predictions are judged more strictly due to available data
      if (actualLower.includes("off by more than 10%") || 
          actualLower.includes("significantly overestimated") ||
          actualLower.includes("significantly underestimated")) {
        score = 1;
      } else if (actualLower.includes("within 5%") || 
                actualLower.includes("very accurate") ||
                actualLower.includes("closely predicted")) {
        score = 3;
      }
      break;
      
    case 'politics':
      // Political predictions focus on outcomes and timing
      if (actualLower.includes("wrong outcome") || 
          actualLower.includes("incorrect winner") ||
          actualLower.includes("opposite happened")) {
        score = 1;
      } else if (actualLower.includes("correct outcome") && 
                actualLower.includes("timing was accurate")) {
        score = 3;
      }
      break;
      
    case 'technology':
      // Technology predictions allow more leeway on timing but focus on direction
      if (actualLower.includes("wrong direction") || 
          actualLower.includes("technology failed") ||
          actualLower.includes("never materialized")) {
        score = 1;
      } else if (actualLower.includes("correct direction") && 
                !actualLower.includes("timing was off")) {
        score = 3;
      }
      break;
      
    case 'foreign-policy':
      // Foreign policy predictions focus on outcomes and key players
      if (actualLower.includes("completely misread") || 
          actualLower.includes("wrong actors") ||
          actualLower.includes("opposite response")) {
        score = 1;
      } else if (actualLower.includes("correctly identified") && 
                actualLower.includes("accurate assessment")) {
        score = 3;
      }
      break;
      
    case 'social-trends':
      // Social trends allow more leeway as they're harder to predict precisely
      if (actualLower.includes("trend moved opposite") || 
          actualLower.includes("completely misread public sentiment")) {
        score = 1;
      } else if (actualLower.includes("trend developed as predicted") && 
                !actualLower.includes("overestimated")) {
        score = 3;
      }
      break;
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
    p.verificationStatus === 'verified' && typeof p.accuracyRating === 'number'
  );
  
  if (verifiedPredictions.length === 0) {
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
  
  // Calculate overall average
  const totalAccuracy = verifiedPredictions.reduce((sum, p) => sum + (p.accuracyRating || 0), 0);
  const averageAccuracy = parseFloat((totalAccuracy / verifiedPredictions.length).toFixed(2));
  
  // Calculate by category
  const categories = {
    economy: [] as number[],
    politics: [] as number[],
    technology: [] as number[],
    foreign_policy: [] as number[],
    social_trends: [] as number[]
  };
  
  verifiedPredictions.forEach(p => {
    const category = p.category.replace('-', '_') as keyof typeof categories;
    if (categories[category] && p.accuracyRating !== undefined) {
      categories[category].push(p.accuracyRating);
    }
  });
  
  const categoryAccuracy: Record<string, number> = {};
  let strongestCategory: PredictionCategory | null = null;
  let weakestCategory: PredictionCategory | null = null;
  let highestAccuracy = 0;
  let lowestAccuracy = 3;
  
  Object.keys(categories).forEach(cat => {
    if (categories[cat as keyof typeof categories].length > 0) {
      const scores = categories[cat as keyof typeof categories];
      const sum = scores.reduce((a, b) => a + b, 0);
      const average = parseFloat((sum / scores.length).toFixed(2));
      
      categoryAccuracy[cat] = average;
      
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
      categoryAccuracy[cat] = 2.0; // Default value for categories with no predictions
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