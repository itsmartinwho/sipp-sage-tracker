
import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getSippById, getPredictionsForSipp, PredictionCategory, getAccuracyColor, formatNumber } from '@/data/sippData';
import NavBar from '@/components/NavBar';
import PredictionItem from '@/components/PredictionItem';
import AccuracyChart from '@/components/AccuracyChart';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';

const SippDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const sipp = getSippById(id || '');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PredictionCategory | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const [newPrediction, setNewPrediction] = useState({
    statement: '',
    category: 'politics' as PredictionCategory,
    timeframe: ''
  });
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  
  if (!sipp) {
    return <Navigate to="/" />;
  }
  
  const predictions = getPredictionsForSipp(sipp.id);
  
  // Filter predictions
  const filteredPredictions = predictions.filter(prediction => {
    // Category filter
    if (selectedCategory !== 'all' && prediction.category !== selectedCategory) {
      return false;
    }
    
    // Date filter
    if (selectedDate && prediction.dateStated !== format(selectedDate, 'yyyy-MM-dd')) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      return prediction.predictedOutcome.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (prediction.actualOutcome && prediction.actualOutcome.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return true;
  });
  
  const handleSubmitPrediction = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setSubmitStatus('success');
      setNewPrediction({
        statement: '',
        category: 'politics',
        timeframe: ''
      });
      
      // Reset status after showing success message
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 mx-auto md:mx-0"
            >
              <img 
                src={sipp.photoUrl} 
                alt={sipp.name} 
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <div className="flex-1 text-center md:text-left">
              <motion.h1 
                className="text-3xl font-bold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {sipp.name}
              </motion.h1>
              
              <motion.p 
                className="text-muted-foreground mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {sipp.shortBio}
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-3 justify-center md:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Overall Accuracy:</span>
                  <Badge 
                    className={`bg-${getAccuracyColor(sipp.averageAccuracy)} text-white font-medium`}
                    variant="secondary"
                  >
                    {formatNumber(sipp.averageAccuracy)}/3
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Predictions:</span>
                  <Badge variant="outline">
                    {predictions.length}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Verified:</span>
                  <Badge variant="outline">
                    {predictions.filter(p => p.verificationStatus === "verified").length}
                  </Badge>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="overview">Overview & Analytics</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-2">Accuracy by Category</h3>
                    <AccuracyChart sipp={sipp} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-2">Pattern Analysis</h3>
                    <p className="text-muted-foreground">{sipp.patternAnalysis}</p>
                    
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Prediction Types</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Definitive Claims</span>
                          <motion.div 
                            className="w-48 h-2 bg-muted rounded-full overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <motion.div 
                              className="h-full bg-blue-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: '65%' }}
                              transition={{ duration: 0.8, delay: 0.6 }}
                            />
                          </motion.div>
                          <span>65%</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span>Qualified Predictions</span>
                          <motion.div 
                            className="w-48 h-2 bg-muted rounded-full overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <motion.div 
                              className="h-full bg-purple-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: '35%' }}
                              transition={{ duration: 0.8, delay: 0.7 }}
                            />
                          </motion.div>
                          <span>35%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Submit New Prediction for Analysis</h3>
                  
                  <form onSubmit={handleSubmitPrediction} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="statement" className="text-sm font-medium">
                        Prediction Statement
                      </label>
                      <Textarea
                        id="statement"
                        placeholder={`Enter a prediction made by ${sipp.name}...`}
                        value={newPrediction.statement}
                        onChange={(e) => setNewPrediction({...newPrediction, statement: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium">
                          Category
                        </label>
                        <Select 
                          value={newPrediction.category} 
                          onValueChange={(value) => setNewPrediction({...newPrediction, category: value as PredictionCategory})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="economy">Economy</SelectItem>
                            <SelectItem value="politics">Politics</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="foreign-policy">Foreign Policy</SelectItem>
                            <SelectItem value="social-trends">Social Trends</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="timeframe" className="text-sm font-medium">
                          Timeframe
                        </label>
                        <Input
                          id="timeframe"
                          placeholder="e.g., End of 2023, Next 6 months"
                          value={newPrediction.timeframe}
                          onChange={(e) => setNewPrediction({...newPrediction, timeframe: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={submitStatus !== 'idle'}
                    >
                      {submitStatus === 'submitting' ? (
                        <span className="loading-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </span>
                      ) : submitStatus === 'success' ? (
                        'Submitted Successfully!'
                      ) : (
                        'Analyze Prediction'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Predictions Tab */}
            <TabsContent value="predictions">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search predictions..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
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
                    
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Date:</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-[180px] pl-3 text-left font-normal">
                            {selectedDate ? (
                              format(selectedDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                          {selectedDate && (
                            <div className="p-2 border-t">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSelectedDate(undefined)}
                              >
                                Clear
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredPredictions.length > 0 ? (
                      filteredPredictions.map((prediction, index) => (
                        <PredictionItem 
                          key={prediction.id} 
                          prediction={prediction} 
                          index={index} 
                        />
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="py-12 text-center"
                      >
                        <div className="text-muted-foreground mb-4">
                          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium">No predictions found</h3>
                        <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                            setSelectedDate(undefined);
                          }}
                        >
                          Clear filters
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default SippDetail;
