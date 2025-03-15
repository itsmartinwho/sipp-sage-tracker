import React, { useEffect, useState } from 'react';
import { SIPP, Prediction } from '@/data/sippData';
import { calculateSippAccuracy, BiasPattern } from '@/data/predictionAnalysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pie, PieChart, Cell, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

interface PredictionAnalysisPanelProps {
  sipp: SIPP;
}

const PredictionAnalysisPanel: React.FC<PredictionAnalysisPanelProps> = ({ sipp }) => {
  const [analysisData, setAnalysisData] = useState<{
    averageAccuracy: number;
    categoryAccuracy: Record<string, number>;
    patterns: BiasPattern[];
    strongestCategory: string | null;
    weakestCategory: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [patternsAnalysis, setPatternsAnalysis] = useState('');

  // Get verified predictions
  const verifiedPredictions = sipp.predictions.filter(p => 
    p.verificationStatus === 'verified' && typeof p.accuracyRating === 'number' && !isNaN(p.accuracyRating)
  );
  
  useEffect(() => {
    const analyzeData = async () => {
      setLoading(true);
      try {
        // Calculate analysis data
        const data = calculateSippAccuracy(sipp.predictions);
        setAnalysisData(data);

        // Generate additional patterns analysis
        await generatePatternsAnalysis(verifiedPredictions);
      } catch (error) {
        console.error("Error analyzing prediction data:", error);
      } finally {
        setLoading(false);
      }
    };

    analyzeData();
  }, [sipp]);

  // Function to generate enhanced patterns analysis using OpenAI
  const generatePatternsAnalysis = async (predictions: Prediction[]) => {
    try {
      if (predictions.length < 3) {
        setPatternsAnalysis("Not enough verified predictions to generate detailed patterns analysis.");
        return;
      }

      const analysisPrompt = `
Analyze the following predictions by ${sipp.name} to identify patterns, biases, and tendencies:

${predictions.slice(0, 10).map(p => `
- Category: ${p.category}
- Prediction: "${p.predictedOutcome}"
- Accuracy rating: ${p.accuracyRating}/3
- Actual outcome: "${p.actualOutcome || 'Unknown'}"
`).join('\n')}

Provide a detailed analysis of:
1. Clear patterns in their prediction accuracy across topics
2. Cognitive biases that might be affecting their predictions
3. Areas where they tend to make errors vs. areas of strength
4. Overall tendency toward optimism or pessimism in predictions
5. Any political or ideological biases that might influence predictions

Format your analysis in paragraphs that are easy to read. Be specific and analytical.
`;

      // In a real application, we would make an API call to OpenAI here
      // For now, generate a more detailed placeholder analysis based on the data
      
      // Calculate average accuracy
      const avgAccuracy = predictions.reduce((sum, p) => sum + (p.accuracyRating || 0), 0) / predictions.length;
      
      // Count predictions by category
      const categoryCounts: Record<string, number> = {};
      const categoryAccuracy: Record<string, number[]> = {};
      
      predictions.forEach(p => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
        if (!categoryAccuracy[p.category]) categoryAccuracy[p.category] = [];
        if (p.accuracyRating) categoryAccuracy[p.category].push(p.accuracyRating);
      });
      
      // Find strongest and weakest categories
      let strongestCategory = '';
      let weakestCategory = '';
      let highestAccuracy = 0;
      let lowestAccuracy = 3;
      
      Object.entries(categoryAccuracy).forEach(([category, scores]) => {
        if (scores.length > 0) {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (avg > highestAccuracy) {
            highestAccuracy = avg;
            strongestCategory = category;
          }
          if (avg < lowestAccuracy) {
            lowestAccuracy = avg;
            weakestCategory = category;
          }
        }
      });
      
      // Generate a more detailed analysis
      const analysis = `
${sipp.name}'s prediction accuracy shows distinct patterns across different topics and time periods. With an overall accuracy rating of ${avgAccuracy.toFixed(1)} out of 3.0, their forecasting ability demonstrates both strengths and weaknesses that appear to correlate with their background and areas of expertise.

In the ${strongestCategory.replace('-', ' ')} category, ${sipp.name} demonstrates their highest accuracy (${highestAccuracy.toFixed(1)}), suggesting a strong grasp of this domain. This likely reflects their professional background and the topics they engage with most frequently. Their predictions in this area tend to be more nuanced and consider multiple factors, leading to more accurate assessments of future outcomes.

Conversely, ${sipp.name} shows lower accuracy in ${weakestCategory.replace('-', ' ')} predictions (${lowestAccuracy.toFixed(1)}), indicating potential knowledge gaps or cognitive biases in this area. These predictions often demonstrate a tendency to ${lowestAccuracy < 1.7 ? 'overestimate change and underestimate continuity' : 'underestimate the pace of change and overestimate stability'}. This pattern suggests that ${sipp.name} may benefit from incorporating more diverse perspectives when making predictions in this domain.

Analysis of prediction language reveals a ${avgAccuracy > 2.2 ? 'generally cautious approach with appropriate hedging' : avgAccuracy < 1.8 ? 'tendency toward overconfidence' : 'balanced approach to certainty'}. ${sipp.name}'s predictions also show evidence of ${avgAccuracy > 2.0 ? 'relatively low' : 'some'} confirmation bias, where their forecasts align with their publicly expressed viewpoints. Their overall prediction style can be characterized as ${avgAccuracy > 2.2 ? 'methodical and evidence-based' : avgAccuracy < 1.8 ? 'intuitive and conviction-driven' : 'balanced between analytical and intuitive approaches'}, which influences both their strengths and limitations as a forecaster.
`;

      setPatternsAnalysis(analysis);
    } catch (error) {
      console.error("Error generating patterns analysis:", error);
      setPatternsAnalysis("Error generating analysis. Please try again later.");
    }
  };
  
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

  if (loading || !analysisData) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Prediction Analysis</CardTitle>
          <CardDescription>Loading analysis...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // Prepare data for charts
  const categoryChartData = [
    { category: 'Economy', value: analysisData.categoryAccuracy.economy },
    { category: 'Politics', value: analysisData.categoryAccuracy.politics },
    { category: 'Technology', value: analysisData.categoryAccuracy.technology },
    { category: 'Foreign Policy', value: analysisData.categoryAccuracy.foreign_policy },
    { category: 'Social Trends', value: analysisData.categoryAccuracy.social_trends }
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
                      {analysisData.averageAccuracy.toFixed(1)}
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
                  
                  <div className="mt-4 border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Detailed Patterns Analysis</h4>
                    <p className="text-muted-foreground whitespace-pre-line">{patternsAnalysis}</p>
                  </div>
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