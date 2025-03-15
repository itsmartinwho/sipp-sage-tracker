
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatNumber, getAccuracyColor, SIPP } from '@/data/sippData';
import NavBar from '@/components/NavBar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PredictionItem from '@/components/PredictionItem';
import { Loader2 } from 'lucide-react';
import { getFallbackImageUrl } from '@/lib/utils';
import { getSippById } from '@/lib/sippApi';
import { useToast } from '@/components/ui/use-toast';

const SippDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sipp, setSipp] = useState<SIPP | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadSippData() {
      try {
        if (!id) return;
        
        setLoading(true);
        
        // Fetch SIPP from Supabase
        const sippData = await getSippById(id);
        
        if (sippData) {
          setSipp(sippData);
        } else {
          toast({
            title: "SIPP not found",
            description: "Could not find the requested SIPP in the database.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error loading SIPP data:", error);
        toast({
          title: "Error loading data",
          description: "There was a problem loading the SIPP data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadSippData();
    }
  }, [id, toast]);

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
            </TabsList>
            <TabsContent value="predictions">
              <div className="grid grid-cols-1 gap-4">
                {sortedPredictions.map((prediction, index) => (
                  <PredictionItem key={prediction.id} prediction={prediction} index={index} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="analysis">
              <Card>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          </Tabs>
        )}
      </motion.main>
    </div>
  );
};

export default SippDetail;
