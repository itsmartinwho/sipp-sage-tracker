
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SIPP, formatNumber, getAccuracyColor, getCategoryColor, PredictionCategory } from '@/data/sippData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SippCardProps {
  sipp: SIPP;
  index: number;
}

const SippCard: React.FC<SippCardProps> = ({ sipp, index }) => {
  // Get top categories by accuracy
  const topCategories = Object.entries(sipp.categoryAccuracy)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([category, accuracy]) => ({
      name: category.replace('_', '-') as PredictionCategory,
      accuracy
    }));

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
                    className={`bg-${getAccuracyColor(sipp.averageAccuracy)}`}
                    variant="secondary"
                  >
                    {formatNumber(sipp.averageAccuracy)}
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
                      className={`bg-${getCategoryColor(category.name)}`}
                      variant="outline"
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
