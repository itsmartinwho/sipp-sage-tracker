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
        <div className="flex flex-col items-center">
          <img src={sipp.photoUrl} alt={sipp.name} className="w-32 h-32 rounded-full mb-4" />
          <h1 className="text-4xl font-bold mb-2">{sipp.name}</h1>
          <p className="text-muted-foreground mb-4">{sipp.shortBio}</p>
          <Badge className={getAccuracyColor(sipp.averageAccuracy)}>
            Overall Accuracy: {formatNumber(sipp.averageAccuracy)}
          </Badge>
        </div>
        
        <Tabs defaultValue="predictions" className="mt-8">
          <TabsList>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="predictions">
            <div className="grid grid-cols-1 gap-4">
              {sortedPredictions.map(prediction => (
                <PredictionItem key={prediction.id} prediction={prediction} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="analysis">
            <Card>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="mt-4">{sipp.patternAnalysis}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.main>
    </div>
  );
};

export default SippDetail;
