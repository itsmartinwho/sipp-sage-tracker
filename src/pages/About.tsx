
import React from 'react';
import { motion } from 'framer-motion';
import NavBar from '@/components/NavBar';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl font-bold tracking-tight mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              About SIPP Tracker
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Understanding the methodology behind our prediction accuracy analysis
            </motion.p>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <h2>Project Overview</h2>
            <p>
              The SIPP Prediction Accuracy Tracker is a web application that tracks and analyzes the 
              prediction accuracy of Strategically Important Press Personalities (SIPPs). We assign 
              accuracy ratings to their past predictions and provide insights into their prediction patterns.
            </p>
            
            <h2>Methodology</h2>
            <p>
              Our system analyzes predictions made by prominent media personalities and assigns normalized 
              accuracy ratings on a 1-3 scale. We extract past predictions, verify outcomes, and calculate 
              accuracy based on multiple factors including prediction specificity, timeframe, and category.
            </p>
            
            <h3>Normalization Formula</h3>
            <p>
              We normalize accuracy ratings based on prediction category volatility:
            </p>
            <ul>
              <li>Economy: Apply 0.3 volatility factor</li>
              <li>Politics: Apply 0.4 volatility factor</li>
              <li>Technology: Apply 0.5 volatility factor</li>
              <li>Foreign Policy: Apply 0.35 volatility factor</li>
              <li>Social Trends: Apply 0.45 volatility factor</li>
            </ul>
            
            <h2>Data Sources</h2>
            <p>
              We gather predictions from multiple sources including:
            </p>
            <ul>
              <li>Television and radio broadcasts</li>
              <li>Social media posts</li>
              <li>Podcast appearances</li>
              <li>Published articles and books</li>
              <li>Public speaking events</li>
            </ul>
            
            <h2>Analysis Process</h2>
            <p>
              Each prediction undergoes a thorough verification process:
            </p>
            <ol>
              <li>Prediction identification and documentation</li>
              <li>Category and timeframe classification</li>
              <li>Outcome verification against factual records</li>
              <li>Accuracy scoring using our proprietary algorithm</li>
              <li>Pattern analysis across categories and time periods</li>
            </ol>
            
            <h2>Meet the Team</h2>
            <p>
              Our team of analysts and data scientists combines expertise in media studies, 
              political science, economics, and artificial intelligence to provide the most 
              comprehensive and objective analysis possible.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default About;
