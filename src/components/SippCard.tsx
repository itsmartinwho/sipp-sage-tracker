import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SIPP, formatNumber, getAccuracyColor, getCategoryColor, PredictionCategory } from '@/data/sippData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFallbackImageUrl } from '@/lib/utils';

interface SippCardProps {
  sipp: SIPP;
  index: number;
  selectedCategory?: PredictionCategory | 'all';
}

// Helper to get top categories with better error handling
const getTopCategories = (sipp: SIPP, selectedCategory: PredictionCategory | 'all' = 'all') => {
  try {
    // If a specific category is selected, prioritize it in the display
    if (selectedCategory !== 'all') {
      const categoryKey = selectedCategory.replace('-', '_') as keyof typeof sipp.categoryAccuracy;
      const categoryScore = sipp.categoryAccuracy[categoryKey];
      
      if (categoryScore !== undefined) {
        // Get the selected category as the first one
        const priorityCategory = {
          name: selectedCategory,
          accuracy: categoryScore as number
        };
        
        // Get the next best category that's not the selected one
        const otherTopCategory = Object.entries(sipp.categoryAccuracy)
          .filter(([category, score]) => 
            typeof score === 'number' && 
            !isNaN(score) && 
            category !== selectedCategory.replace('-', '_')
          )
          .sort(([_cat1, a], [_cat2, b]) => (b as number) - (a as number))
          .slice(0, 1)
          .map(([category, accuracy]) => ({
            name: category.replace('_', '-') as PredictionCategory,
            accuracy: accuracy as number
          }))[0];
        
        return otherTopCategory ? [priorityCategory, otherTopCategory] : [priorityCategory];
      }
    }
    
    // Default behavior - get top 2 categories
    return Object.entries(sipp.categoryAccuracy)
      // Make sure we have valid numeric scores
      .filter(([_category, score]) => typeof score === 'number' && !isNaN(score))
      // Sort by accuracy (highest first)
      .sort(([_cat1, a], [_cat2, b]) => (b as number) - (a as number))
      // Take the top 2
      .slice(0, 2)
      .map(([category, accuracy]) => ({
        name: category.replace('_', '-') as PredictionCategory,
        accuracy: accuracy as number
      }));
  } catch (error) {
    console.error("Error getting top categories:", error);
    // Return fallback data
    return [
      { name: 'economy' as PredictionCategory, accuracy: 2.0 },
      { name: 'politics' as PredictionCategory, accuracy: 2.0 }
    ];
  }
};

const SippCard: React.FC<SippCardProps> = ({ sipp, index, selectedCategory = 'all' }) => {
  // Add console log for debugging
  console.log(`[DEBUG] Rendering SippCard for ${sipp.name} with score: ${sipp.averageAccuracy.toFixed(1)}`);
  
  // Determine which accuracy to display based on category selection
  let displayedAccuracy = sipp.averageAccuracy;
  
  if (selectedCategory !== 'all') {
    // Use the category-specific accuracy if a category is selected
    const categoryKey = selectedCategory.replace('-', '_') as keyof typeof sipp.categoryAccuracy;
    const categoryScore = sipp.categoryAccuracy[categoryKey];
    
    if (typeof categoryScore === 'number' && !isNaN(categoryScore)) {
      displayedAccuracy = categoryScore;
      console.log(`[DEBUG] Using category score for ${sipp.name}: ${selectedCategory} = ${displayedAccuracy.toFixed(1)}`);
    }
  }
  
  // Ensure we have a valid accuracy value
  displayedAccuracy = typeof displayedAccuracy === 'number' && !isNaN(displayedAccuracy) 
    ? displayedAccuracy 
    : 2.0;
  
  // Get top categories by accuracy with error handling
  const topCategories = getTopCategories(sipp, selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/sipp/${sipp.id}`} className="block h-full">
        <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-0 relative">
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={sipp.photoUrl} 
                alt={sipp.name} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loops
                  console.log(`Image load error for ${sipp.name}, using fallback`);
                  // Use a colored background with initials as fallback
                  target.src = getFallbackImageUrl(sipp.name, 200);
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white text-lg font-medium">{sipp.name}</h3>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                  <Badge 
                    style={{ backgroundColor: `hsl(var(--${getAccuracyColor(displayedAccuracy)}))` }}
                    variant="secondary"
                    className="relative"
                    // Add a data attribute for debugging
                    data-accuracy={displayedAccuracy.toFixed(1)}
                  >
                    {formatNumber(displayedAccuracy)}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">(scale: 1-3)</span>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">{sipp.shortBio}</p>
              
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Top Categories</span>
                <div className="flex flex-wrap gap-2">
                  {topCategories.map(category => (
                    <Badge 
                      key={category.name}
                      style={{ backgroundColor: `hsl(var(--${getCategoryColor(category.name)}))` }}
                      variant="outline"
                      // Add a data attribute for debugging
                      data-category-accuracy={category.accuracy.toFixed(1)}
                    >
                      {category.name.replace('-', ' ')} ({formatNumber(category.accuracy)})
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default SippCard;
