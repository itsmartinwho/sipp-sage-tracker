
export interface SIPP {
  id: string;
  name: string;
  photoUrl: string;
  shortBio: string;
  averageAccuracy: number;
  categoryAccuracy: {
    economy: number;
    politics: number;
    technology: number;
    foreign_policy: number;
    social_trends: number;
  };
  patternAnalysis: string;
}

export interface Prediction {
  id: string;
  sippId: string;
  dateStated: string;
  predictedOutcome: string;
  category: PredictionCategory;
  timeframe: string;
  verificationStatus: "pending" | "verified" | "unverifiable";
  actualOutcome?: string;
  accuracyRating?: number; // 1-3 scale
  normalizedScore?: number; // 0-1 scale
}

export type PredictionCategory = "economy" | "politics" | "technology" | "foreign_policy" | "social_trends";

// Category volatility factors for normalization
export const CATEGORY_VOLATILITY: Record<PredictionCategory, number> = {
  economy: 0.3,
  politics: 0.4,
  technology: 0.5,
  foreign_policy: 0.35,
  social_trends: 0.45
};

// Sample data for the 10 SIPPs
export const SIPP_DATA: SIPP[] = [
  {
    id: "tucker-carlson",
    name: "Tucker Carlson",
    photoUrl: "https://source.unsplash.com/collection/4466406/400x400?1",
    shortBio: "Conservative political commentator, former Fox News host",
    averageAccuracy: 1.7,
    categoryAccuracy: {
      economy: 1.5,
      politics: 1.8,
      technology: 1.3,
      foreign_policy: 1.9,
      social_trends: 1.6
    },
    patternAnalysis: "Shows higher accuracy in foreign policy predictions, tends to make definitive claims about economic outcomes that often miss nuance."
  },
  {
    id: "rachel-maddow",
    name: "Rachel Maddow",
    photoUrl: "https://source.unsplash.com/collection/4466406/400x400?2",
    shortBio: "Progressive political commentator, MSNBC host",
    averageAccuracy: 1.9,
    categoryAccuracy: {
      economy: 1.7,
      politics: 2.2,
      technology: 1.6,
      foreign_policy: 2.0,
      social_trends: 1.8
    },
    patternAnalysis: "Most accurate on political process predictions, less reliable on technology trends. Often qualifies predictions, increasing overall accuracy."
  },
  {
    id: "elon-musk",
    name: "Elon Musk",
    photoUrl: "https://source.unsplash.com/collection/4466406/400x400?3",
    shortBio: "Tech entrepreneur, owner of X/Twitter",
    averageAccuracy: 2.1,
    categoryAccuracy: {
      economy: 2.0,
      politics: 1.6,
      technology: 2.5,
      foreign_policy: 1.5,
      social_trends: 1.9
    },
    patternAnalysis: "High accuracy in technology predictions, particularly in areas related to his businesses. Tends to be overly optimistic about timeframes."
  },
  {
    id: "nate-silver",
    name: "Nate Silver",
    photoUrl: "https://source.unsplash.com/collection/4466406/400x400?4",
    shortBio: "Data journalist, founder of FiveThirtyEight",
    averageAccuracy: 2.5,
    categoryAccuracy: {
      economy: 2.3,
      politics: 2.7,
      technology: 2.2,
      foreign_policy: 2.4,
      social_trends: 2.3
    },
    patternAnalysis: "Consistently provides probabilistic predictions with measured confidence. Most accurate in political forecasting using statistical models."
  },
  {
    id: "sean-hannity",
    name: "Sean Hannity",
    photoUrl: "https://source.unsplash.com/collection/4466406/400x400?5",
    shortBio: "Conservative political commentator, Fox News host",
    averageAccuracy: 1.6,
    categoryAccuracy: {
      economy: 1.7,
      politics: 1.8,
      technology: 1.2,
      foreign_policy: 1.6,
      social_trends: 1.5
    },
    patternAnalysis: "Makes definitive predictions in political spheres that align with conservative viewpoints. More accurate on economic trends than social predictions."
  },
  {
    id: "anderson-cooper",
    name: "Anderson Cooper",
    photoUrl: "https://source.unsplash.com/collection/4466406/400x400?6",
    shortBio: "CNN anchor and correspondent",
    averageAccuracy: 2.0,
    categoryAccuracy: {
      economy: 1.9,
      politics: 2.1,
      technology: 1.7,
      foreign_policy: 2.3,
      social_trends: 2.0
    },
    patternAnalysis: "Tends to be measured in predictions, particularly in foreign policy where his experience shows. Rarely makes definitive claims without evidence."
  },
  {
    id: "ben-shapiro",
    name: "Ben Shapiro",
    photoUrl: "https://source.unsplash.com/collection/4466406/400x400?7",
    shortBio: "Conservative political commentator, founder of The Daily Wire",
    averageAccuracy: 1.8,
    categoryAccuracy: {
      economy: 2.0,
      politics: 1.9,
      technology: 1.5,
      foreign_policy: 1.7,
      social_trends: 1.6
    },
    patternAnalysis: "Stronger accuracy in economic predictions, less reliable in social trends forecasting. Tends to make categorical assertions in complex domains."
  },
  {
    id: "ezra-klein",
    name: "Ezra Klein",
    photoUrl: "https://source.unsplash.com/collection/4466406/400x400?8",
    shortBio: "Liberal political analyst, co-founder of Vox",
    averageAccuracy: 2.2,
    categoryAccuracy: {
      economy: 2.1,
      politics: 2.4,
      technology: 2.0,
      foreign_policy: 2.0,
      social_trends: 2.3
    },
    patternAnalysis: "Contextualizes predictions with caveats and measured confidence. Most accurate in political system and policy outcome predictions."
  },
  {
    id: "joe-rogan",
    name: "Joe Rogan",
    photoUrl: "https://source.unsplash.com/collection/4466406/400x400?9",
    shortBio: "Podcast host with wide-ranging political discussions",
    averageAccuracy: 1.9,
    categoryAccuracy: {
      economy: 1.7,
      politics: 1.8,
      technology: 2.0,
      foreign_policy: 1.5,
      social_trends: 2.2
    },
    patternAnalysis: "More accurate in social trend predictions, often frames discussions as possibilities rather than certainties. Synthesizes guest opinions."
  },
  {
    id: "krystal-ball",
    name: "Krystal Ball",
    photoUrl: "https://source.unsplash.com/collection/4466406/400x400?10",
    shortBio: "Progressive political commentator, co-host of Breaking Points",
    averageAccuracy: 2.0,
    categoryAccuracy: {
      economy: 2.1,
      politics: 2.2,
      technology: 1.6,
      foreign_policy: 1.8,
      social_trends: 2.1
    },
    patternAnalysis: "Shows greater accuracy in economic inequality predictions. Often contrarian to mainstream viewpoints, with mixed results in prediction accuracy."
  }
];

// Generate sample predictions for each SIPP
export const generateSamplePredictions = (): Prediction[] => {
  const predictions: Prediction[] = [];
  const categories: PredictionCategory[] = ["economy", "politics", "technology", "foreign_policy", "social_trends"];
  const statuses: ("pending" | "verified" | "unverifiable")[] = ["verified", "verified", "verified", "pending"];
  
  // Sample prediction content by category
  const predictionTemplates: Record<PredictionCategory, string[]> = {
    economy: [
      "Inflation will reach {X}% by {timeframe}",
      "The Federal Reserve will {action} interest rates by {timeframe}",
      "Unemployment will {increase/decrease} to {X}% due to {reason}",
      "The stock market will {rise/fall} by {X}% within {timeframe}",
      "There will be a recession starting in {timeframe}"
    ],
    politics: [
      "{Candidate} will win the {election} by a margin of {X}%",
      "The {Party} will take control of {chamber} in the {year} elections",
      "The Supreme Court will rule in favor of {position} on {issue}",
      "The President's approval rating will {rise/fall} to {X}% after {event}",
      "{Bill/Policy} will {pass/fail} in Congress by {timeframe}"
    ],
    technology: [
      "{Company} will release a breakthrough in {technology} by {timeframe}",
      "Artificial intelligence will disrupt the {industry} industry within {timeframe}",
      "Cryptocurrency {name} will {rise/fall} to ${amount} by {timeframe}",
      "Autonomous vehicles will achieve {milestone} by {timeframe}",
      "The next generation of {device} will include {feature} technology"
    ],
    foreign_policy: [
      "{Country} will {action} with respect to {issue} by {timeframe}",
      "Diplomatic relations between {country1} and {country2} will {improve/deteriorate}",
      "Military conflict will {escalate/deescalate} in {region} due to {reason}",
      "A peace agreement will be reached in {region} by {timeframe}",
      "{Country} will experience regime change due to {reason}"
    ],
    social_trends: [
      "The {movement} movement will gain significant momentum by {timeframe}",
      "{Platform} will {gain/lose} {X}% of its user base within {year}",
      "Remote work will {increase/decrease} by {X}% across {industry}",
      "Public opinion on {issue} will shift toward {position} due to {event}",
      "A new social media platform will disrupt {existing platform}'s dominance"
    ]
  };
  
  // Generate actual outcomes
  const generateOutcome = (prediction: string, rating: number): string => {
    if (rating === 3) return `Exactly as predicted: ${prediction.replace("{timeframe}", "").replace("{X}", "").trim()}`;
    if (rating === 2) return `Partially accurate: Some aspects occurred but with different timing or magnitude`;
    return `Did not occur as predicted: Outcome was substantially different or opposite`;
  };
  
  // For each SIPP, generate 15-20 predictions
  SIPP_DATA.forEach(sipp => {
    const numPredictions = 15 + Math.floor(Math.random() * 6); // 15-20 predictions
    
    for (let i = 0; i < numPredictions; i++) {
      // Select a random category, favoring their stronger categories
      const categoryWeights = Object.entries(sipp.categoryAccuracy)
        .map(([category, accuracy]) => ({
          category: category.replace("_", "-") as PredictionCategory,
          weight: accuracy
        }));
      
      // Weighted random selection
      const totalWeight = categoryWeights.reduce((sum, item) => sum + item.weight, 0);
      let randomWeight = Math.random() * totalWeight;
      let selectedCategory: PredictionCategory = "politics";
      
      for (const { category, weight } of categoryWeights) {
        randomWeight -= weight;
        if (randomWeight <= 0) {
          selectedCategory = category;
          break;
        }
      }
      
      // Random date in the last 3 years
      const daysAgo = Math.floor(Math.random() * 1095); // Up to 3 years ago
      const dateStated = new Date();
      dateStated.setDate(dateStated.getDate() - daysAgo);
      
      // Random time frame
      const timeFrames = ["end of year", "Q4 2023", "next 6 months", "2024 election", "next decade"];
      const timeframe = timeFrames[Math.floor(Math.random() * timeFrames.length)];
      
      // Random status, weighted toward verified
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random template from the category
      const templateOptions = predictionTemplates[selectedCategory];
      const template = templateOptions[Math.floor(Math.random() * templateOptions.length)];
      
      // Replace placeholders
      let predictedOutcome = template
        .replace("{timeframe}", timeframe)
        .replace("{X}", (Math.floor(Math.random() * 20) + 1).toString());
      
      // Generate rating based on their accuracy in this category
      let accuracyRating: number | undefined;
      let actualOutcome: string | undefined;
      let normalizedScore: number | undefined;
      
      if (status === "verified") {
        // Base accuracy on their category rating with some randomness
        const baseAccuracy = sipp.categoryAccuracy[selectedCategory.replace("-", "_") as keyof typeof sipp.categoryAccuracy];
        const randomFactor = Math.random() * 0.5 - 0.25; // -0.25 to +0.25
        const calculatedAccuracy = baseAccuracy + randomFactor;
        
        // Convert to 1-3 scale
        accuracyRating = Math.max(1, Math.min(3, Math.round(calculatedAccuracy)));
        actualOutcome = generateOutcome(predictedOutcome, accuracyRating);
        
        // Apply normalization formula
        const volatilityFactor = CATEGORY_VOLATILITY[selectedCategory];
        normalizedScore = (accuracyRating - 1) / 2 * (1 - volatilityFactor);
      }
      
      predictions.push({
        id: `${sipp.id}-pred-${i}`,
        sippId: sipp.id,
        dateStated: dateStated.toISOString().split('T')[0],
        predictedOutcome,
        category: selectedCategory,
        timeframe,
        verificationStatus: status,
        actualOutcome,
        accuracyRating,
        normalizedScore
      });
    }
  });
  
  return predictions;
};

// Pre-generate the sample predictions
export const SAMPLE_PREDICTIONS = generateSamplePredictions();

// Helper function to get all predictions for a specific SIPP
export const getPredictionsForSipp = (sippId: string): Prediction[] => {
  return SAMPLE_PREDICTIONS.filter(prediction => prediction.sippId === sippId);
};

// Helper function to get a specific SIPP by ID
export const getSippById = (id: string): SIPP | undefined => {
  return SIPP_DATA.find(sipp => sipp.id === id);
};

// Helper to format a date in a readable format
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Function to get the color for an accuracy score
export const getAccuracyColor = (score: number): string => {
  if (score < 1.7) return "accuracy-low";
  if (score < 2.3) return "accuracy-medium";
  return "accuracy-high";
};

// Function to get the category color
export const getCategoryColor = (category: PredictionCategory): string => {
  return `category-${category}`;
};

// Format a number to 1 decimal place
export const formatNumber = (num: number): string => {
  return num.toFixed(1);
};
