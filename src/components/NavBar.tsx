
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart2, Home, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NavBar: React.FC = () => {
  const location = useLocation();
  const isDetailPage = location.pathname.includes('/sipp/');

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b pb-2"
    >
      <div className="container px-4 py-4 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            <span className="font-medium text-lg hidden sm:inline-block">SIPP Prediction Tracker</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {isDetailPage ? (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline-block">Home</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/about" className="flex items-center">
                    <Info className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline-block">About</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default NavBar;
