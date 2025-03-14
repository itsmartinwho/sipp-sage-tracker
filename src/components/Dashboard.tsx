
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SIPP_DATA, PredictionCategory } from '@/data/sippData';
import SippCard from './SippCard';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SortDesc, SortAsc } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Dashboard: React.FC = () => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<PredictionCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort SIPPs
  const filteredSipps = SIPP_DATA.filter(sipp => {
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
