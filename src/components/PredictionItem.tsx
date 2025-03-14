
import React from 'react';
import { motion } from 'framer-motion';
import { Prediction, formatDate, getAccuracyColor, getCategoryColor } from '@/data/sippData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
                <Badge variant="outline" className={`bg-${getCategoryColor(prediction.category)}/10 text-${getCategoryColor(prediction.category)}`}>
                  {prediction.category.replace('-', ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatDate(prediction.dateStated)}
                </span>
              </div>
              
              {prediction.accuracyRating ? (
                <Badge className={`bg-${getAccuracyColor(prediction.accuracyRating)}`}>
                  {prediction.accuracyRating}/3
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted/50">
                  {prediction.verificationStatus}
                </Badge>
              )}
            </div>
            
            <div>
              <h4 className="font-medium">Prediction:</h4>
              <p className="text-sm">{prediction.predictedOutcome}</p>
              <div className="text-xs text-muted-foreground mt-1">
                Timeframe: {prediction.timeframe}
              </div>
            </div>
            
            {prediction.actualOutcome && (
              <div className="pt-2 border-t border-border">
                <h4 className="font-medium text-sm">Actual outcome:</h4>
                <p className="text-sm">{prediction.actualOutcome}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PredictionItem;
