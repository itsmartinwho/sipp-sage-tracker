
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center space-y-6"
        >
          <div className="text-8xl font-bold text-primary/50">404</div>
          
          <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
          
          <p className="text-xl text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="pt-6">
            <Button asChild size="lg">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default NotFound;
