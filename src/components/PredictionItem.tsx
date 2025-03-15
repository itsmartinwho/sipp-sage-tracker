import React from 'react';
import { motion } from 'framer-motion';
import { Prediction, formatNumber, getAccuracyColor, getCategoryColor, formatDate } from '@/data/sippData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PredictionItemProps {
  prediction: Prediction;
  index: number;
}

const PredictionItem: React.FC<PredictionItemProps> = ({ prediction, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Card className="overflow-hidden border-l-4 hover:shadow-md transition-all duration-300"
            style={{ borderLeftColor: `hsl(var(--${getCategoryColor(prediction.category)}))` }}>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline" 
                       style={{ backgroundColor: `hsl(var(--${getCategoryColor(prediction.category)}))/0.1`, 
                                color: `hsl(var(--${getCategoryColor(prediction.category)}))` }}>
                  {prediction.category.replace('-', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatDate(prediction.dateStated)}
                </span>
              </div>
              
              {prediction.accuracyRating ? (
                <div className="flex flex-col items-end">
                  <Badge style={{ backgroundColor: `hsl(var(--${getAccuracyColor(prediction.accuracyRating)}))` }}>
                    {formatNumber(prediction.accuracyRating)}/3
                  </Badge>
                  {prediction.normalizedScore && (
                    <span className="text-xs text-muted-foreground mt-1">
                      Normalized: {formatNumber(prediction.normalizedScore)}
                    </span>
                  )}
                </div>
              ) : (
                <Badge variant="outline" className="bg-muted/50">
                  {prediction.verificationStatus}
                </Badge>
              )}
            </div>
            
            <p className="font-medium my-2">{prediction.predictedOutcome}</p>
            
            {prediction.actualOutcome && (
              <div className="mt-3 text-sm">
                <span className="font-medium">Actual outcome: </span>
                <span className="text-muted-foreground">{prediction.actualOutcome}</span>
              </div>
            )}
            
            {prediction.analysisExplanation && (
              <div className="mt-2 text-sm border-t pt-2">
                <span className="font-medium text-xs text-orange-600">Analysis: </span>
                <span className="text-muted-foreground">{prediction.analysisExplanation}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PredictionItem;
