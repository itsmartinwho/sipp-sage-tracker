
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
    default: return 'muted';
  }
};

// Sample SIPP data
export const SIPP_DATA: SIPP[] = [
  {
    id: "tucker-carlson",
    name: "Tucker Carlson",
    photoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
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
    predictions: []
  },
  {
    id: "rachel-maddow",
    name: "Rachel Maddow",
    photoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
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
    predictions: []
  },
  {
    id: "elon-musk",
    name: "Elon Musk",
    photoUrl: "https://randomuser.me/api/portraits/men/22.jpg",
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
    predictions: []
  },
  {
    id: "nate-silver",
    name: "Nate Silver",
    photoUrl: "https://randomuser.me/api/portraits/men/78.jpg",
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
    predictions: []
  },
  {
    id: "sean-hannity",
    name: "Sean Hannity",
    photoUrl: "https://randomuser.me/api/portraits/men/55.jpg",
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
    predictions: []
  },
  {
    id: "anderson-cooper",
    name: "Anderson Cooper",
    photoUrl: "https://randomuser.me/api/portraits/men/65.jpg",
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
    predictions: []
  },
  {
    id: "ben-shapiro",
    name: "Ben Shapiro",
    photoUrl: "https://randomuser.me/api/portraits/men/12.jpg",
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
    predictions: []
  },
  {
    id: "ezra-klein",
    name: "Ezra Klein",
    photoUrl: "https://randomuser.me/api/portraits/men/37.jpg",
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
    predictions: []
  },
  {
    id: "joe-rogan",
    name: "Joe Rogan",
    photoUrl: "https://randomuser.me/api/portraits/men/91.jpg",
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
    predictions: []
  },
  {
    id: "krystal-ball",
    name: "Krystal Ball",
    photoUrl: "https://randomuser.me/api/portraits/women/86.jpg",
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
    predictions: []
  }
];
