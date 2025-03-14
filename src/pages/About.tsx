
import React from 'react';
import { motion } from 'framer-motion';
import NavBar from '@/components/NavBar';
import { Card, CardContent } from '@/components/ui/card';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <motion.h1 
            className="text-3xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            About SIPP Prediction Tracker
          </motion.h1>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-medium mb-4">Project Overview</h2>
              <p className="text-muted-foreground mb-4">
                The SIPP Prediction Accuracy Tracker analyzes and tracks the prediction accuracy of Strategically Important Press Personalities (SIPPs) - influential figures whose predictions shape public discourse and decision-making.
              </p>
              <p className="text-muted-foreground">
                Our system assigns normalized accuracy ratings to past predictions made by these personalities and provides insights into their prediction patterns. By tracking this data, we aim to provide transparency and context for how reliable different sources are when making predictions about future events.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-medium mb-4">Methodology</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Data Collection</h3>
                  <p className="text-muted-foreground">Predictions are collected from public statements, articles, social media posts, and broadcasts made by each SIPP.</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Accuracy Rating Scale</h3>
                  <p className="text-muted-foreground">We use a 1-3 scale for accuracy ratings:</p>
                  <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                    <li><span className="font-medium text-red-500">1</span> - Prediction was mostly or entirely incorrect</li>
                    <li><span className="font-medium text-amber-500">2</span> - Prediction was partially correct or had significant caveats</li>
                    <li><span className="font-medium text-green-500">3</span> - Prediction was largely or entirely correct</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">Normalization Formula</h3>
                  <p className="text-muted-foreground">
                    We normalize accuracy ratings based on prediction category volatility:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
                    <li>Economy: Apply 0.3 volatility factor</li>
                    <li>Politics: Apply 0.4 volatility factor</li>
                    <li>Technology: Apply 0.5 volatility factor</li>
                    <li>Foreign Policy: Apply 0.35 volatility factor</li>
                    <li>Social Trends: Apply 0.45 volatility factor</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">Pattern Analysis</h3>
                  <p className="text-muted-foreground">
                    We analyze patterns in each SIPP's predictions to identify areas of strength, bias patterns, and predictive tendencies. This analysis is performed using natural language processing and statistical analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-medium mb-4">Disclaimer</h2>
              <p className="text-muted-foreground">
                This project is for informational purposes only. The SIPP Prediction Tracker does not endorse any particular personality or viewpoint. Our goal is to provide objective analysis of prediction accuracy to help users better evaluate information sources.
              </p>
              <p className="text-muted-foreground mt-4">
                All data presented is based on publicly available information. While we strive for accuracy, we acknowledge that prediction verification involves some subjective judgment, especially for complex or nuanced predictions.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default About;
