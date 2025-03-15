
import { PredictionCategory } from "@/types/sipp";

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
