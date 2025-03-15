import React from 'react';
import { SIPP, Prediction } from '@/data/sippData';
import { calculateSippAccuracy, BiasPattern } from '@/data/predictionAnalysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pie, PieChart, Cell, Legend } from 'recharts';

interface PredictionAnalysisPanelProps {
  sipp: SIPP;
}

const PredictionAnalysisPanel: React.FC<PredictionAnalysisPanelProps> = ({ sipp }) => {
  // Get verified predictions
  const verifiedPredictions = sipp.predictions.filter(p => 
    p.verificationStatus === 'verified' && typeof p.accuracyRating === 'number'
  );
  
  // Check if we have enough data for meaningful analysis
  if (verifiedPredictions.length < 3) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Prediction Analysis</CardTitle>
          <CardDescription>Not enough verified predictions for detailed analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {sipp.name} needs at least 3 verified predictions to generate a meaningful analysis.
            Currently there {verifiedPredictions.length === 1 ? 'is' : 'are'} only {verifiedPredictions.length} verified prediction{verifiedPredictions.length === 1 ? '' : 's'}.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate analysis data
  const analysisData = calculateSippAccuracy(sipp.predictions);
  
  // Prepare data for charts
  const categoryChartData = [
    { category: 'Economy', value: sipp.categoryAccuracy.economy },
    { category: 'Politics', value: sipp.categoryAccuracy.politics },
    { category: 'Technology', value: sipp.categoryAccuracy.technology },
    { category: 'Foreign Policy', value: sipp.categoryAccuracy.foreign_policy },
    { category: 'Social Trends', value: sipp.categoryAccuracy.social_trends }
  ].sort((a, b) => b.value - a.value);
  
  // Accuracy distribution
  const accuracyDistribution = [
    { 
      name: 'Incorrect', 
      value: verifiedPredictions.filter(p => p.accuracyRating && p.accuracyRating < 1.5).length,
      color: 'hsl(var(--accuracy-low))'
    },
    { 
      name: 'Partially Correct', 
      value: verifiedPredictions.filter(p => p.accuracyRating && p.accuracyRating >= 1.5 && p.accuracyRating < 2.5).length,
      color: 'hsl(var(--accuracy-medium))'
    },
    { 
      name: 'Fully Correct', 
      value: verifiedPredictions.filter(p => p.accuracyRating && p.accuracyRating >= 2.5).length,
      color: 'hsl(var(--accuracy-high))'
    }
  ];
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Prediction Analysis</CardTitle>
        <CardDescription>
          Based on {verifiedPredictions.length} verified predictions across different categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="patterns">Patterns & Bias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">Overall Accuracy</h3>
                  <div className="flex items-center mb-4">
                    <div className="text-4xl font-bold mr-2">
                      {sipp.averageAccuracy.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      out of 3.0
                    </div>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-line">{sipp.patternAnalysis}</p>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">Accuracy Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={accuracyDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {accuracyDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Accuracy by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      domain={[0, 3]} 
                      tickCount={4} 
                    />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      width={100}
                    />
                    <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}/3.0`, 'Accuracy']} />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 4, 4, 0]}
                    >
                      {categoryChartData.map((entry, index) => {
                        let color = 'hsl(var(--accuracy-medium))';
                        if (entry.value < 1.7) color = 'hsl(var(--accuracy-low))';
                        if (entry.value >= 2.3) color = 'hsl(var(--accuracy-high))';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Category Analysis</h3>
                <div className="space-y-2">
                  {analysisData.strongestCategory && (
                    <div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Strongest</Badge>
                      <span className="ml-2 font-medium">
                        {analysisData.strongestCategory.replace('-', ' ')}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Shows highest accuracy in this category, demonstrating particular expertise or careful analysis.
                      </p>
                    </div>
                  )}
                  
                  {analysisData.weakestCategory && (
                    <div>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">Weakest</Badge>
                      <span className="ml-2 font-medium">
                        {analysisData.weakestCategory.replace('-', ' ')}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Shows lower accuracy in this category, suggesting potential bias or knowledge gaps.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="patterns">
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Bias Patterns & Tendencies</h3>
              
              {analysisData.patterns.length > 0 ? (
                <div className="space-y-4">
                  {analysisData.patterns.map((pattern, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{pattern.type}</h4>
                        <Badge variant="outline">
                          {(pattern.frequency * 100).toFixed(0)}% of predictions
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1">{pattern.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Not enough data to identify clear bias patterns. More verified predictions are needed.
                </p>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Incorrect Predictions Analysis</h3>
                
                {verifiedPredictions.filter(p => p.accuracyRating && p.accuracyRating < 2 && p.analysisExplanation).length > 0 ? (
                  <div className="space-y-3">
                    {verifiedPredictions
                      .filter(p => p.accuracyRating && p.accuracyRating < 2 && p.analysisExplanation)
                      .slice(0, 3)
                      .map((prediction, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-start">
                            <Badge variant="outline" className="mt-0.5 mr-2">
                              {prediction.category.replace('-', ' ')}
                            </Badge>
                            <div>
                              <p className="font-medium">{prediction.predictedOutcome}</p>
                              <p className="text-sm text-muted-foreground mt-1">{prediction.analysisExplanation}</p>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No detailed analysis available for incorrect predictions.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PredictionAnalysisPanel; 