import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SIPP_DATA, PredictionCategory, loadRealSippData, SIPP } from '@/data/sippData';
import SippCard from './SippCard';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SortDesc, SortAsc, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { preloadImages, getFallbackImageUrl } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<PredictionCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sipps, setSipps] = useState<SIPP[]>(SIPP_DATA);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load SIPP data when component mounts
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Get the base URL depending on environment
        const baseUrl = window.location.href.includes('lovable.dev') 
          ? '/sipp-sage-tracker'
          : '';
        
        // Try to load from pregenerated JSON file
        try {
          const response = await fetch(`${baseUrl}/data/sippData.json`);
          if (response.ok) {
            const jsonData = await response.json();
            
            // Validate that the data has the expected structure
            if (Array.isArray(jsonData) && 
                jsonData.length > 0 && 
                jsonData[0].photoUrl && 
                jsonData[0].predictions) {
              
              // Make sure Tucker Carlson's image is updated
              const updatedData = jsonData.map(sipp => {
                if (sipp.name === "Tucker Carlson") {
                  return {
                    ...sipp,
                    photoUrl: "/lovable-uploads/dc4415b9-f384-4c81-b95d-952a1c7c3849.png"
                  };
                }
                return sipp;
              });
              
              setSipps(updatedData);
              console.log("Successfully loaded SIPP data from JSON file");
              toast({
                title: "Data loaded successfully",
                description: "SIPP data has been loaded with actual photos and predictions.",
              });
              setLoading(false);
              return;
            } else {
              console.error("JSON data is not in the expected format:", jsonData);
            }
          } else {
            console.error("Error fetching sippData.json:", response.status, response.statusText);
          }
        } catch (fetchError) {
          console.error("Error fetching pregenerated data:", fetchError);
        }
        
        // If we get here, try to generate data dynamically
        console.log("Generating data dynamically...");
        const realData = await loadRealSippData();
        
        // Ensure Tucker Carlson has the correct image
        const updatedRealData = realData.map(sipp => {
          if (sipp.name === "Tucker Carlson") {
            return {
              ...sipp,
              photoUrl: "/lovable-uploads/dc4415b9-f384-4c81-b95d-952a1c7c3849.png"
            };
          }
          return sipp;
        });
        
        // Validate and ensure each SIPP has a working image URL
        for (const sipp of updatedRealData) {
          // Make sure each SIPP has a valid photoUrl
          if (!sipp.photoUrl || sipp.photoUrl.trim() === '') {
            console.warn(`Missing photo URL for ${sipp.name}, using fallback`);
            sipp.photoUrl = getFallbackImageUrl(sipp.name);
          }
        }
        
        // Preload images in the background
        preloadImages(updatedRealData.map(sipp => sipp.photoUrl));
        
        setSipps(updatedRealData);
        toast({
          title: "Data generated successfully",
          description: "SIPP data has been dynamically generated with photos and predictions.",
        });
      } catch (error) {
        console.error("Error loading SIPP data:", error);
        toast({
          title: "Error loading data",
          description: "There was a problem loading the real SIPP data. Using fallback data instead.",
          variant: "destructive",
        });
        
        // Update Tucker Carlson's image in the fallback data
        const updatedFallbackData = SIPP_DATA.map(sipp => {
          if (sipp.name === "Tucker Carlson") {
            return {
              ...sipp,
              photoUrl: "/lovable-uploads/dc4415b9-f384-4c81-b95d-952a1c7c3849.png"
            };
          }
          return sipp;
        });
        
        // Ensure we have at least the template data with updated image
        setSipps(updatedFallbackData);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [toast]);

  // Filter and sort SIPPs
  const filteredSipps = sipps.filter(sipp => {
    // Category filter
    if (selectedCategory !== 'all') {
      const categoryKey = selectedCategory.replace('-', '_') as keyof typeof sipp.categoryAccuracy;
      if (!sipp.categoryAccuracy[categoryKey]) return false;
    }
    
    // Search query
    if (searchQuery) {
      return sipp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             sipp.shortBio.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by average accuracy
    if (selectedCategory === 'all') {
      return sortOrder === 'desc' 
        ? b.averageAccuracy - a.averageAccuracy 
        : a.averageAccuracy - b.averageAccuracy;
    } else {
      // Sort by specific category accuracy
      const categoryKey = selectedCategory.replace('-', '_') as keyof typeof a.categoryAccuracy;
      return sortOrder === 'desc' 
        ? b.categoryAccuracy[categoryKey] - a.categoryAccuracy[categoryKey] 
        : a.categoryAccuracy[categoryKey] - b.categoryAccuracy[categoryKey];
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium">Loading SIPP data...</h3>
        <p className="text-muted-foreground mt-1">Fetching images and predictions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search SIPPs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Category:</span>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="politics">Politics</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="foreign-policy">Foreign Policy</SelectItem>
                <SelectItem value="social-trends">Social Trends</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="ml-2"
          >
            {sortOrder === 'desc' ? (
              <SortDesc className="h-4 w-4 mr-2" />
            ) : (
              <SortAsc className="h-4 w-4 mr-2" />
            )}
            {sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
          </Button>
        </div>
      </div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredSipps.map((sipp, index) => (
          <SippCard key={sipp.id} sipp={sipp} index={index} />
        ))}
      </motion.div>
      
      {filteredSipps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground mb-4">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 10V11M14 10V11M9.5 15C10.4 16 11.6 16.5 12.8 16.5C14 16.5 15.2 16 16.1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
