
import { Prediction, PredictionCategory } from "@/types/sipp";

// Sample predictions for each SIPP
export const createPredictions = (): Prediction[] => {
  const predictions: Prediction[] = [
    // Economy predictions
    {
      id: "pred-1",
      dateStated: "2022-01-15",
      predictedOutcome: "Inflation will peak at over 8% by mid-2022",
      category: "economy",
      timeframe: "mid-2022",
      verificationStatus: "verified",
      actualOutcome: "Inflation peaked at 9.1% in June 2022",
      accuracyRating: 2.8,
      normalizedScore: 0.85
    },
    {
      id: "pred-2",
      dateStated: "2022-03-10",
      predictedOutcome: "The Federal Reserve will raise interest rates at least 5 times in 2022",
      category: "economy",
      timeframe: "end of 2022",
      verificationStatus: "verified",
      actualOutcome: "The Federal Reserve raised interest rates 7 times in 2022",
      accuracyRating: 2.5,
      normalizedScore: 0.78
    },
    {
      id: "pred-3",
      dateStated: "2021-12-05",
      predictedOutcome: "Stock market will enter a bear market by mid-2022",
      category: "economy",
      timeframe: "mid-2022",
      verificationStatus: "verified",
      actualOutcome: "S&P 500 entered bear market in June 2022",
      accuracyRating: 2.9,
      normalizedScore: 0.90
    },
    
    // Politics predictions
    {
      id: "pred-4",
      dateStated: "2022-02-20",
      predictedOutcome: "Democrats will lose control of the House in 2022 midterms",
      category: "politics",
      timeframe: "November 2022",
      verificationStatus: "verified",
      actualOutcome: "Republicans gained control of the House in 2022 midterms",
      accuracyRating: 2.7,
      normalizedScore: 0.82
    },
    {
      id: "pred-5",
      dateStated: "2022-05-15",
      predictedOutcome: "Senate will remain split 50-50 after midterms",
      category: "politics",
      timeframe: "November 2022",
      verificationStatus: "verified",
      actualOutcome: "Democrats gained a seat in the Senate (51-49)",
      accuracyRating: 1.5,
      normalizedScore: 0.45
    },
    
    // Technology predictions
    {
      id: "pred-6",
      dateStated: "2021-11-10",
      predictedOutcome: "Metaverse will fail to gain mainstream adoption in 2022",
      category: "technology",
      timeframe: "end of 2022",
      verificationStatus: "verified",
      actualOutcome: "Metaverse initiatives failed to gain significant user traction",
      accuracyRating: 2.8,
      normalizedScore: 0.87
    },
    {
      id: "pred-7",
      dateStated: "2022-01-25",
      predictedOutcome: "Twitter will face major management changes within a year",
      category: "technology",
      timeframe: "January 2023",
      verificationStatus: "verified",
      actualOutcome: "Elon Musk acquired Twitter in October 2022",
      accuracyRating: 3.0,
      normalizedScore: 0.95
    },
    
    // Foreign policy predictions
    {
      id: "pred-8",
      dateStated: "2022-01-05",
      predictedOutcome: "Russia will initiate military action against Ukraine before April",
      category: "foreign-policy",
      timeframe: "Q1 2022",
      verificationStatus: "verified",
      actualOutcome: "Russia invaded Ukraine in February 2022",
      accuracyRating: 2.9,
      normalizedScore: 0.91
    },
    {
      id: "pred-9",
      dateStated: "2022-06-18",
      predictedOutcome: "China will increase military presence around Taiwan",
      category: "foreign-policy",
      timeframe: "end of 2022",
      verificationStatus: "verified",
      actualOutcome: "China conducted unprecedented military exercises around Taiwan in August 2022",
      accuracyRating: 2.7,
      normalizedScore: 0.83
    },
    
    // Social trends predictions
    {
      id: "pred-10",
      dateStated: "2021-12-15",
      predictedOutcome: "Remote work will become a permanent option for at least 30% of the workforce",
      category: "social-trends",
      timeframe: "end of 2022",
      verificationStatus: "verified",
      actualOutcome: "About 35% of workers had remote or hybrid arrangements by end of 2022",
      accuracyRating: 2.6,
      normalizedScore: 0.80
    },
    
    // Recent predictions not yet verified
    {
      id: "pred-11",
      dateStated: "2023-02-10",
      predictedOutcome: "AI will disrupt content creation industries significantly by end of 2023",
      category: "technology",
      timeframe: "end of 2023",
      verificationStatus: "pending"
    },
    {
      id: "pred-12",
      dateStated: "2023-03-25",
      predictedOutcome: "Housing market will see a 10% price correction in major urban areas",
      category: "economy",
      timeframe: "Q4 2023",
      verificationStatus: "pending"
    },
    {
      id: "pred-13",
      dateStated: "2023-04-15",
      predictedOutcome: "A new significant social media platform will emerge to rival Twitter",
      category: "technology",
      timeframe: "end of 2023",
      verificationStatus: "pending"
    }
  ];
  
  return predictions;
};
