import React from 'react';
import { motion } from 'framer-motion';
import Dashboard from '@/components/Dashboard';
import NavBar from '@/components/NavBar';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="text-center max-w-3xl mx-auto mb-10">
            <motion.h1 
              className="text-4xl font-bold tracking-tight mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              PROPHET
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Analyzing the prediction accuracy of Strategically Important Press Personalities
            </motion.p>
          </div>
          
          <Dashboard />
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
