import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SIPP_DATA, formatNumber, getAccuracyColor, SIPP } from '@/data/sippData';
import NavBar from '@/components/NavBar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PredictionItem from '@/components/PredictionItem';
import PredictionAnalysisPanel from '@/components/PredictionAnalysisPanel';
import { Loader2 } from 'lucide-react';
import { preloadImages, getFallbackImageUrl } from '@/lib/utils';
import { calculateSippAccuracy } from '@/data/predictionAnalysis';

// Helper function to ensure we have valid accuracy data
const validateSippData = (sipp: SIPP): SIPP => {
  console.log(`[DEBUG] Validating SIPP data for ${sipp.name} in detail view`);
  
  // Make a deep copy to avoid mutating the original object
  const validatedSipp = JSON.parse(JSON.stringify(sipp));
  
  // Recalculate averages based on the actual predictions
  const accuracyData = calculateSippAccuracy(validatedSipp.predictions);
  
  // Apply the calculated data
  validatedSipp.averageAccuracy = accuracyData.averageAccuracy;
  validatedSipp.categoryAccuracy = accuracyData.categoryAccuracy;
  
  console.log(`[DEBUG] Validated accuracy for ${sipp.name}: ${validatedSipp.averageAccuracy.toFixed(2)}`);
  console.log('[DEBUG] Category accuracy:', validatedSipp.categoryAccuracy);
  
  return validatedSipp;
};

const SippDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sipp, setSipp] = useState<SIPP | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSippData() {
      try {
        setLoading(true);

        // Get the base URL depending on environment
        const baseUrl = window.location.href.includes('lovable.dev') 
          ? '/sipp-sage-tracker'
          : '';
        
        // Map of reliable image paths for each SIPP
        const reliableImagePaths = {
          "Tucker Carlson": "/lovable-uploads/dc4415b9-f384-4c81-b95d-952a1c7c3849.png",
          "Rachel Maddow": "/lovable-uploads/c844125c-dc7e-4e4d-878c-8c237999c9b5.png",
          "Elon Musk": "/lovable-uploads/0d2c9e34-5b94-48a2-a7ff-e928ed7818ac.png",
          "Nate Silver": "/lovable-uploads/e9915d12-f691-4ce5-912c-330023f9a16b.png",
          "Sean Hannity": "/lovable-uploads/e08e1c1f-75ae-4e63-8e39-1031441d6435.png",
          "Anderson Cooper": "/lovable-uploads/a1a3d886-769a-4116-84b0-27a1cbbeb947.png",
          "Ben Shapiro": "/lovable-uploads/142a495e-df1d-48b0-b7b3-85d6a049d420.png",
          "Ezra Klein": "/lovable-uploads/928cfe89-be28-4b21-b62d-84037e1c20f9.png",
          "Joe Rogan": "/lovable-uploads/aad243bb-10d6-4507-ba12-3c3feb720071.png",
          "Krystal Ball": "/lovable-uploads/29d1d72f-3504-4b6c-9e6b-aecc18ce59b0.png"
        };
        
        // Try to load from pregenerated JSON file
        try {
          const response = await fetch(`${baseUrl}/data/sippData.json`);
          if (response.ok) {
            const jsonData = await response.json();
            
            // Find the SIPP with the matching ID
            const matchingSipp = jsonData.find((s: SIPP) => s.id === id);
            
            if (matchingSipp) {
              // Make sure to use our reliable image paths
              if (reliableImagePaths[matchingSipp.name]) {
                matchingSipp.photoUrl = reliableImagePaths[matchingSipp.name];
              }
              
              // Validate the SIPP data to ensure accuracy scores are correct
              const validatedSipp = validateSippData(matchingSipp);
              setSipp(validatedSipp);
              
              // Preload the image for this SIPP
              if (validatedSipp.photoUrl) {
                preloadImages([validatedSipp.photoUrl]);
              }
              
              setLoading(false);
              return;
            }
          }
        } catch (fetchError) {
          console.error("Error fetching SIPP data:", fetchError);
        }
        
        // Fallback to template data
        const fallbackSipp = SIPP_DATA.find(s => s.id === id);
        
        // Make sure to use our reliable image paths for the fallback SIPP
        if (fallbackSipp && reliableImagePaths[fallbackSipp.name]) {
          fallbackSipp.photoUrl = reliableImagePaths[fallbackSipp.name];
        }
        
        // Validate fallback SIPP data as well
        if (fallbackSipp) {
          const validatedFallbackSipp = validateSippData(fallbackSipp);
          setSipp(validatedFallbackSipp);
        } else {
          setSipp(null);
        }
      } catch (error) {
        console.error("Error loading SIPP data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadSippData();
    }
  }, [id]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-medium">Loading SIPP data...</h3>
        </div>
      </div>
    );
  }
  
  // Show not found state
  if (!sipp) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold">SIPP Not Found</h1>
          <p className="mt-4 text-muted-foreground">The personality you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-8 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Return to Dashboard
          </button>
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
          <div className="w-32 h-32 overflow-hidden rounded-full mb-4">
            <img 
              src={sipp?.photoUrl} 
              alt={sipp?.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loops
                console.log(`Image load error for ${sipp?.name} in detail view, using fallback`);
                target.src = getFallbackImageUrl(sipp?.name || "", 128);
              }} 
            />
          </div>
          <h1 className="text-4xl font-bold mb-2">{sipp?.name}</h1>
          <p className="text-muted-foreground mb-4">{sipp?.shortBio}</p>
          {sipp && (
            <Badge style={{ backgroundColor: `hsl(var(--${getAccuracyColor(sipp.averageAccuracy)}))` }}>
              Overall Accuracy: {formatNumber(sipp.averageAccuracy)}
            </Badge>
          )}
        </div>
        
        {sipp && (
          <Tabs defaultValue="predictions" className="mt-8">
            <TabsList>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="predictions">
              <div className="grid grid-cols-1 gap-4">
                {sipp.predictions.sort(
                  (a, b) => new Date(b.dateStated).getTime() - new Date(a.dateStated).getTime()
                ).map((prediction, index) => (
                  <PredictionItem key={prediction.id} prediction={prediction} index={index} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="analysis">
              <Card>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={[
                        { category: 'Economy', value: sipp.categoryAccuracy.economy },
                        { category: 'Politics', value: sipp.categoryAccuracy.politics },
                        { category: 'Technology', value: sipp.categoryAccuracy.technology },
                        { category: 'Foreign Policy', value: sipp.categoryAccuracy.foreign_policy },
                        { category: 'Social Trends', value: sipp.categoryAccuracy.social_trends }
                      ]} 
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 3]} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="mt-4 whitespace-pre-line">{sipp.patternAnalysis}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="detailed">
              <PredictionAnalysisPanel sipp={sipp} />
            </TabsContent>
          </Tabs>
        )}
      </motion.main>
    </div>
  );
};

export default SippDetail;
