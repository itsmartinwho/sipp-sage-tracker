
import { Prediction, PredictionCategory } from "@/types/sipp";

// Scoring system for different prediction categories
export const calculateAccuracyScore = (
  prediction: Prediction, 
  actualOutcome: string
): number => {
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
  
  // Category-specific scoring adjustments
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

// Function to normalize scores based on prediction category
export const normalizeScore = (score: number, category: PredictionCategory): number => {
  // Different categories have different difficulty levels for prediction
  const categoryDifficulty: Record<PredictionCategory, number> = {
    'economy': 0.9, // Economic predictions are harder (more precise data available)
    'politics': 0.8,
    'technology': 0.7, // Technology predictions are more difficult
    'foreign-policy': 0.75,
    'social-trends': 0.6 // Social trends are the most difficult to predict precisely
  };
  
  // Normalize the score based on category difficulty
  // This scales the raw score to account for prediction difficulty
  return score * categoryDifficulty[category];
};
