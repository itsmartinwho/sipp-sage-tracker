
import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SIPP_DATA, formatNumber, getAccuracyColor } from '@/data/sippData';
import NavBar from '@/components/NavBar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PredictionItem from '@/components/PredictionItem';

const SippDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const sipp = SIPP_DATA.find(s => s.id === id);
  
  if (!sipp) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold">SIPP Not Found</h1>
          <p className="mt-4 text-muted-foreground">The personality you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  const categoryChartData = [
    { category: 'Economy', value: sipp.categoryAccuracy.economy },
    { category: 'Politics', value: sipp.categoryAccuracy.politics },
    { category: 'Technology', value: sipp.categoryAccuracy.technology },
    { category: 'Foreign Policy', value: sipp.categoryAccuracy.foreign_policy },
    { category: 'Social Trends', value: sipp.categoryAccuracy.social_trends }
  ];
  
  // Sort predictions by date (newest first)
  const sortedPredictions = [...sipp.predictions].sort(
    (a, b) => new Date(b.dateStated).getTime() - new Date(a.dateStated).getTime()
  );
  
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-6 mb-8"
          >
            <div className="md:w-1/3">
              <div className="rounded-lg overflow-hidden aspect-square">
                <img 
                  src={sipp.photoUrl} 
                  alt={sipp.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="md:w-2/3 space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">{sipp.name}</h1>
              
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Accuracy Rating:</span>
                <Badge 
                  className={`bg-${getAccuracyColor(sipp.averageAccuracy)} text-white text-lg px-3 py-1`}
                >
                  {formatNumber(sipp.averageAccuracy)}
                </Badge>
              </div>
              
              <p className="text-lg text-muted-foreground">{sipp.shortBio}</p>
              
              <div className="pt-2">
                <h3 className="text-lg font-medium mb-2">Pattern Analysis</h3>
                <p>{sipp.patternAnalysis}</p>
              </div>
            </div>
          </motion.div>
          
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analytics" className="space-y-6 pt-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-4">Accuracy by Category</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[1, 3]} ticks={[1, 1.5, 2, 2.5, 3]} />
                        <YAxis type="category" dataKey="category" width={120} />
                        <Tooltip formatter={(value) => [formatNumber(value as number), 'Accuracy']} />
                        <Bar 
                          dataKey="value" 
                          radius={[0, 4, 4, 0]}
                          label={{ position: 'right', formatter: (value: number) => formatNumber(value) }}
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="predictions" className="pt-4">
              <Card>
                <CardContent className="pt-6 pb-6">
                  <h3 className="text-xl font-medium mb-4">Predictions</h3>
                  
                  {sortedPredictions.length > 0 ? (
                    <div className="space-y-4">
                      {sortedPredictions.map((prediction, index) => (
                        <PredictionItem 
                          key={prediction.id} 
                          prediction={prediction} 
                          index={index} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No predictions available for this SIPP.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.main>
    </div>
  );
};

export default SippDetail;
