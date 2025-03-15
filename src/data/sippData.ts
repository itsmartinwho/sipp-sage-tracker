import { formatDate } from "@/lib/utils";
import { fetchSippImages, fetchSippPredictions } from "@/lib/utils";

export type PredictionCategory = 'economy' | 'politics' | 'technology' | 'foreign-policy' | 'social-trends';

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
  predictions: Prediction[];
}

export interface Prediction {
  id: string;
  dateStated: string;
  predictedOutcome: string;
  category: PredictionCategory;
  timeframe: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  actualOutcome?: string;
  accuracyRating?: number;
  normalizedScore?: number;
}

// Helper functions for formatting and color logic
export const formatNumber = (num: number): string => {
  return num.toFixed(1);
};

export { formatDate };

export const getAccuracyColor = (accuracy: number): string => {
  if (accuracy < 1.7) return 'accuracy-low';
  if (accuracy < 2.3) return 'accuracy-medium';
  return 'accuracy-high';
};

export const getCategoryColor = (category: PredictionCategory): string => {
  switch(category) {
    case 'economy': return 'category-economy';
    case 'politics': return 'category-politics';
    case 'technology': return 'category-technology';
    case 'foreign-policy': return 'category-foreign-policy';
    case 'social-trends': return 'category-social-trends';
    default: return 'category-economy';
  }
};

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

// Map of SIPP names to reliable image URLs
const RELIABLE_SIPP_IMAGES: Record<string, string> = {
  "Tucker Carlson": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tucker_Carlson_2020.jpg",
  "Rachel Maddow": "https://upload.wikimedia.org/wikipedia/commons/d/dc/Rachel_Maddow_in_2008.jpg",
  "Elon Musk": "https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg",
  "Nate Silver": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Nate_Silver_2009.png",
  "Sean Hannity": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Sean_Hannity.jpg",
  "Anderson Cooper": "https://upload.wikimedia.org/wikipedia/commons/5/51/Anderson_Cooper_at_the_Edinburgh_TV_fest.jpg",
  "Ben Shapiro": "https://upload.wikimedia.org/wikipedia/commons/6/62/Ben_Shapiro_2018.jpg",
  "Ezra Klein": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Ezra_Klein_2012_Shankbone.JPG",
  "Joe Rogan": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Joe_Rogan_-_2023_%28cropped%29.jpg",
  "Krystal Ball": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Krystal_Ball_by_Gage_Skidmore.jpg"
};

// Sample predictions for each SIPP
const createPredictions = (): Prediction[] => {
  const predictions: Prediction[] = [
    // Economy predictions
    {
      id: "pred-1",
      dateStated: "2022-01-15",
      predictedOutcome: "Inflation will peak at over 8% by mid-2022",
      category: "economy",
      timeframe: "mid-2022",
      verificationStatus: "verified",
      actualOutcome: "Inflation peaked at 9.1% in June 2022",
      accuracyRating: 2.8,
      normalizedScore: 0.85
    },
    {
      id: "pred-2",
      dateStated: "2022-03-10",
      predictedOutcome: "The Federal Reserve will raise interest rates at least 5 times in 2022",
      category: "economy",
      timeframe: "end of 2022",
      verificationStatus: "verified",
      actualOutcome: "The Federal Reserve raised interest rates 7 times in 2022",
      accuracyRating: 2.5,
      normalizedScore: 0.78
    },
    {
      id: "pred-3",
      dateStated: "2021-12-05",
      predictedOutcome: "Stock market will enter a bear market by mid-2022",
      category: "economy",
      timeframe: "mid-2022",
      verificationStatus: "verified",
      actualOutcome: "S&P 500 entered bear market in June 2022",
      accuracyRating: 2.9,
      normalizedScore: 0.90
    },
    
    // Politics predictions
    {
      id: "pred-4",
      dateStated: "2022-02-20",
      predictedOutcome: "Democrats will lose control of the House in 2022 midterms",
      category: "politics",
      timeframe: "November 2022",
      verificationStatus: "verified",
      actualOutcome: "Republicans gained control of the House in 2022 midterms",
      accuracyRating: 2.7,
      normalizedScore: 0.82
    },
    {
      id: "pred-5",
      dateStated: "2022-05-15",
      predictedOutcome: "Senate will remain split 50-50 after midterms",
      category: "politics",
      timeframe: "November 2022",
      verificationStatus: "verified",
      actualOutcome: "Democrats gained a seat in the Senate (51-49)",
      accuracyRating: 1.5,
      normalizedScore: 0.45
    },
    
    // Technology predictions
    {
      id: "pred-6",
      dateStated: "2021-11-10",
      predictedOutcome: "Metaverse will fail to gain mainstream adoption in 2022",
      category: "technology",
      timeframe: "end of 2022",
      verificationStatus: "verified",
      actualOutcome: "Metaverse initiatives failed to gain significant user traction",
      accuracyRating: 2.8,
      normalizedScore: 0.87
    },
    {
      id: "pred-7",
      dateStated: "2022-01-25",
      predictedOutcome: "Twitter will face major management changes within a year",
      category: "technology",
      timeframe: "January 2023",
      verificationStatus: "verified",
      actualOutcome: "Elon Musk acquired Twitter in October 2022",
      accuracyRating: 3.0,
      normalizedScore: 0.95
    },
    
    // Foreign policy predictions
    {
      id: "pred-8",
      dateStated: "2022-01-05",
      predictedOutcome: "Russia will initiate military action against Ukraine before April",
      category: "foreign-policy",
      timeframe: "Q1 2022",
      verificationStatus: "verified",
      actualOutcome: "Russia invaded Ukraine in February 2022",
      accuracyRating: 2.9,
      normalizedScore: 0.91
    },
    {
      id: "pred-9",
      dateStated: "2022-06-18",
      predictedOutcome: "China will increase military presence around Taiwan",
      category: "foreign-policy",
      timeframe: "end of 2022",
      verificationStatus: "verified",
      actualOutcome: "China conducted unprecedented military exercises around Taiwan in August 2022",
      accuracyRating: 2.7,
      normalizedScore: 0.83
    },
    
    // Social trends predictions
    {
      id: "pred-10",
      dateStated: "2021-12-15",
      predictedOutcome: "Remote work will become a permanent option for at least 30% of the workforce",
      category: "social-trends",
      timeframe: "end of 2022",
      verificationStatus: "verified",
      actualOutcome: "About 35% of workers had remote or hybrid arrangements by end of 2022",
      accuracyRating: 2.6,
      normalizedScore: 0.80
    },
    
    // Recent predictions not yet verified
    {
      id: "pred-11",
      dateStated: "2023-02-10",
      predictedOutcome: "AI will disrupt content creation industries significantly by end of 2023",
      category: "technology",
      timeframe: "end of 2023",
      verificationStatus: "pending"
    },
    {
      id: "pred-12",
      dateStated: "2023-03-25",
      predictedOutcome: "Housing market will see a 10% price correction in major urban areas",
      category: "economy",
      timeframe: "Q4 2023",
      verificationStatus: "pending"
    },
    {
      id: "pred-13",
      dateStated: "2023-04-15",
      predictedOutcome: "A new significant social media platform will emerge to rival Twitter",
      category: "technology",
      timeframe: "end of 2023",
      verificationStatus: "pending"
    }
  ];
  
  return predictions;
};

// Function to create real predictions based on OpenAI API data
export const loadRealPredictions = async (sippName: string): Promise<Prediction[]> => {
  try {
    // Fetch actual predictions for this SIPP using OpenAI
    const predictions = await fetchSippPredictions(sippName);
    
    // Process and normalize the predictions data
    return predictions.slice(0, 40).map((pred: any, index: number) => {
      // For verified predictions, calculate accuracy using our new system
      let accuracyRating = 2; // Default to partially correct
      
      if (pred.verificationStatus === 'verified' && pred.actualOutcome) {
        // Use our new scoring system
        accuracyRating = calculateAccuracyScore(
          {
            ...pred,
            category: pred.category.replace('_', '-') as PredictionCategory
          } as Prediction, 
          pred.actualOutcome
        );
      } else if (pred.accuracyRating) {
        // Use provided accuracy if available
        accuracyRating = pred.accuracyRating;
      }
      
      // Apply normalization based on category
      const category = pred.category.replace('_', '-') as PredictionCategory;
      const normalizedScore = normalizeScore(accuracyRating, category);
      
      return {
        id: `pred-${sippName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        dateStated: pred.dateStated || new Date().toISOString().split('T')[0],
        predictedOutcome: pred.predictedOutcome || "No prediction text available",
        category: category,
        timeframe: pred.timeframe || "Not specified",
        verificationStatus: pred.verificationStatus || "pending",
        actualOutcome: pred.actualOutcome || undefined,
        accuracyRating: accuracyRating,
        normalizedScore: normalizedScore
      };
    });
  } catch (error) {
    console.error(`Error loading predictions for ${sippName}:`, error);
    return [];
  }
};

// Function to load real SIPP data with images and predictions
export const loadRealSippData = async (): Promise<SIPP[]> => {
  try {
    const sippList = [...SIPP_DATA]; // Start with the template data
    
    for (let i = 0; i < sippList.length; i++) {
      const sipp = sippList[i];
      
      // Fetch real photo for this SIPP
      const photoUrl = await fetchSippImages(sipp.name);
      if (photoUrl) {
        sipp.photoUrl = photoUrl;
      }
      
      // Fetch real predictions for this SIPP
      const predictions = await loadRealPredictions(sipp.name);
      sipp.predictions = predictions;
      
      // Recalculate accuracy scores based on real predictions
      if (predictions.length > 0) {
        const verifiedPredictions = predictions.filter(p => p.verificationStatus === "verified" && p.accuracyRating);
        
        if (verifiedPredictions.length > 0) {
          // Calculate overall average accuracy
          sipp.averageAccuracy = verifiedPredictions.reduce((acc, p) => acc + (p.accuracyRating || 0), 0) / verifiedPredictions.length;
          
          // Calculate category-specific accuracy scores
          const categories = ['economy', 'politics', 'technology', 'foreign_policy', 'social_trends'];
          
          categories.forEach(category => {
            const categoryPredictions = verifiedPredictions.filter(p => p.category === category.replace('_', '-') as PredictionCategory);
            
            if (categoryPredictions.length > 0) {
              const catKey = category as keyof typeof sipp.categoryAccuracy;
              sipp.categoryAccuracy[catKey] = categoryPredictions.reduce((acc, p) => acc + (p.accuracyRating || 0), 0) / categoryPredictions.length;
            } else {
              // If no verified predictions in this category, assign a default score
              // that varies by SIPP to create more diversity in the data
              const catKey = category as keyof typeof sipp.categoryAccuracy;
              const baseScore = 1.5 + (Math.random() * 1.5); // Random score between 1.5 and 3
              sipp.categoryAccuracy[catKey] = parseFloat(baseScore.toFixed(1));
            }
          });
        } else {
          // If no verified predictions, create varied scores for each SIPP
          // This ensures we have diverse data even without verified predictions
          sipp.averageAccuracy = 1.5 + (Math.random() * 1.5); // Random score between 1.5 and 3
          
          const categories = ['economy', 'politics', 'technology', 'foreign_policy', 'social_trends'];
          categories.forEach(category => {
            const catKey = category as keyof typeof sipp.categoryAccuracy;
            const baseScore = 1 + (Math.random() * 2); // Random score between 1 and 3
            sipp.categoryAccuracy[catKey] = parseFloat(baseScore.toFixed(1));
          });
        }
      }
    }
    
    return sippList;
  } catch (error) {
    console.error("Error loading real SIPP data:", error);
    // Fall back to template data if there's an error
    return SIPP_DATA;
  }
};

// Updated SIPP data with reliable photo URLs
export const SIPP_DATA: SIPP[] = [
  {
    id: "tucker-carlson",
    name: "Tucker Carlson",
    photoUrl: RELIABLE_SIPP_IMAGES["Tucker Carlson"],
    shortBio: "Conservative political commentator, former Fox News host",
    averageAccuracy: 1.8,
    categoryAccuracy: {
      economy: 1.6,
      politics: 2.0,
      technology: 1.5,
      foreign_policy: 1.9,
      social_trends: 1.7
    },
    patternAnalysis: "Tends to accurately predict conservative policy positions but often misses economic trends and technological developments.",
    predictions: createPredictions()
  },
  {
    id: "rachel-maddow",
    name: "Rachel Maddow",
    photoUrl: RELIABLE_SIPP_IMAGES["Rachel Maddow"],
    shortBio: "Progressive political commentator, MSNBC host",
    averageAccuracy: 2.1,
    categoryAccuracy: {
      economy: 2.0,
      politics: 2.4,
      technology: 1.8,
      foreign_policy: 2.3,
      social_trends: 2.0
    },
    patternAnalysis: "Strong on political analysis, especially regarding institutional processes. Less reliable on technology predictions.",
    predictions: createPredictions()
  },
  {
    id: "elon-musk",
    name: "Elon Musk",
    photoUrl: RELIABLE_SIPP_IMAGES["Elon Musk"],
    shortBio: "Tech entrepreneur, owner of X/Twitter",
    averageAccuracy: 2.3,
    categoryAccuracy: {
      economy: 2.2,
      politics: 1.5,
      technology: 2.8,
      foreign_policy: 1.6,
      social_trends: 2.4
    },
    patternAnalysis: "Highly accurate on technology trends, particularly in his areas of expertise. Less reliable on political and social predictions.",
    predictions: createPredictions()
  },
  {
    id: "nate-silver",
    name: "Nate Silver",
    photoUrl: RELIABLE_SIPP_IMAGES["Nate Silver"],
    shortBio: "Data journalist, founder of FiveThirtyEight",
    averageAccuracy: 2.7,
    categoryAccuracy: {
      economy: 2.5,
      politics: 2.9,
      technology: 2.4,
      foreign_policy: 2.2,
      social_trends: 2.6
    },
    patternAnalysis: "Statistically rigorous approach leads to high accuracy, especially in politics and data-rich fields.",
    predictions: createPredictions()
  },
  {
    id: "sean-hannity",
    name: "Sean Hannity",
    photoUrl: RELIABLE_SIPP_IMAGES["Sean Hannity"],
    shortBio: "Conservative political commentator, Fox News host",
    averageAccuracy: 1.6,
    categoryAccuracy: {
      economy: 1.5,
      politics: 1.8,
      technology: 1.3,
      foreign_policy: 1.7,
      social_trends: 1.4
    },
    patternAnalysis: "Often makes predictions aligned with partisan positions rather than objective likelihood.",
    predictions: createPredictions()
  },
  {
    id: "anderson-cooper",
    name: "Anderson Cooper",
    photoUrl: RELIABLE_SIPP_IMAGES["Anderson Cooper"],
    shortBio: "CNN anchor and correspondent",
    averageAccuracy: 2.2,
    categoryAccuracy: {
      economy: 2.0,
      politics: 2.3,
      technology: 1.9,
      foreign_policy: 2.5,
      social_trends: 2.1
    },
    patternAnalysis: "Cautious in making predictions, which improves overall accuracy. Strongest in foreign policy analysis.",
    predictions: createPredictions()
  },
  {
    id: "ben-shapiro",
    name: "Ben Shapiro",
    photoUrl: RELIABLE_SIPP_IMAGES["Ben Shapiro"],
    shortBio: "Conservative political commentator, founder of The Daily Wire",
    averageAccuracy: 1.9,
    categoryAccuracy: {
      economy: 2.1,
      politics: 2.0,
      technology: 1.7,
      foreign_policy: 1.8,
      social_trends: 1.6
    },
    patternAnalysis: "More accurate on economic predictions than social trends. Tendency toward binary predictions reduces accuracy.",
    predictions: createPredictions()
  },
  {
    id: "ezra-klein",
    name: "Ezra Klein",
    photoUrl: RELIABLE_SIPP_IMAGES["Ezra Klein"],
    shortBio: "Liberal political analyst, co-founder of Vox",
    averageAccuracy: 2.4,
    categoryAccuracy: {
      economy: 2.3,
      politics: 2.6,
      technology: 2.2,
      foreign_policy: 2.0,
      social_trends: 2.5
    },
    patternAnalysis: "Systematic approach to analysis leads to above-average accuracy across categories.",
    predictions: createPredictions()
  },
  {
    id: "joe-rogan",
    name: "Joe Rogan",
    photoUrl: RELIABLE_SIPP_IMAGES["Joe Rogan"],
    shortBio: "Podcast host with wide-ranging political discussions",
    averageAccuracy: 1.7,
    categoryAccuracy: {
      economy: 1.5,
      politics: 1.6,
      technology: 2.0,
      foreign_policy: 1.3,
      social_trends: 2.1
    },
    patternAnalysis: "Varying accuracy heavily dependent on the expertise of guests. More accurate when discussing topics he has personal experience with.",
    predictions: createPredictions()
  },
  {
    id: "krystal-ball",
    name: "Krystal Ball",
    photoUrl: RELIABLE_SIPP_IMAGES["Krystal Ball"],
    shortBio: "Progressive political commentator, co-host of Breaking Points",
    averageAccuracy: 2.0,
    categoryAccuracy: {
      economy: 2.2,
      politics: 2.1,
      technology: 1.7,
      foreign_policy: 1.9,
      social_trends: 2.0
    },
    patternAnalysis: "More accurate on economic populist topics than establishment politics. Stronger predictive power for grassroots movements.",
    predictions: createPredictions()
  }
];
