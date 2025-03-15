
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import OpenAI from "openai"
import { supabase, PredictionRecord } from "./supabase"
import { PredictionCategory } from "@/data/sippData"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true, // Allow browser usage
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (input: Date | string) => {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

// Map of SIPP names to reliable image URLs
export const RELIABLE_SIPP_IMAGES: Record<string, string> = {
  "Tucker Carlson": "/lovable-uploads/dc4415b9-f384-4c81-b95d-952a1c7c3849.png",
  "Rachel Maddow": "/lovable-uploads/c844125c-dc7e-4e4d-878c-8c237999c9b5.png",
  "Elon Musk": "/lovable-uploads/0d2c9e34-5b94-48a2-a7ff-e928ed7818ac.png",
  "Nate Silver": "/lovable-uploads/e9915d12-f691-4ce5-912c-330023f9a16b.png",
  "Sean Hannity": "/lovable-uploads/e08e1c1f-75ae-4e63-8e39-1031441d6435.png",
  "Anderson Cooper": "/lovable-uploads/a1a3d886-769a-4116-84b0-27a1cbbeb947.png",
  "Ben Shapiro": "/lovable-uploads/142a495e-df1d-48b0-b7b3-85d6a049d420.png",
  "Ezra Klein": "/lovable-uploads/928cfe89-be28-4b21-b62d-84037e1c20f9.png",
  "Joe Rogan": "/lovable-uploads/aad243bb-10d6-4507-ba12-3c3feb720071.png",
  "Krystal Ball": "/lovable-uploads/29d1d72f-3504-4b6c-9e6b-aecc18ce59b0.png"
};

// Function to generate a consistent fallback image URL for a SIPP
export function getFallbackImageUrl(name: string, size: number = 200): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random&color=fff&bold=true`;
}

// Function to preload images for better performance
export function preloadImages(imageUrls: string[]): void {
  imageUrls.forEach(url => {
    if (url && url.trim() !== '') {
      const img = new Image();
      img.src = url;
    }
  });
}

// Function to retrieve images for SIPPs - now checks Supabase first
export async function fetchSippImages(sippName: string): Promise<string> {
  try {
    // First check if the SIPP exists in Supabase
    const { data: sippData } = await supabase
      .from('sipps')
      .select('photo_url')
      .eq('name', sippName)
      .single();
    
    if (sippData?.photo_url) {
      console.log(`Using Supabase image for ${sippName}`);
      return sippData.photo_url;
    }
    
    // Then try to get from our reliable map
    if (RELIABLE_SIPP_IMAGES[sippName]) {
      console.log(`Using cached image for ${sippName}`);
      return RELIABLE_SIPP_IMAGES[sippName];
    }

    // Fallback to a generic placeholder based on name initials
    console.log(`No image found for ${sippName}, using generated avatar`);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(sippName)}&background=random&size=200`;
  } catch (error) {
    console.error("Error fetching image:", error);
    // Return a generic placeholder based on name initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(sippName)}&background=random&size=200`;
  }
}

// Calculate accuracy score for a prediction
export function calculateAccuracyScore(
  prediction: PredictionRecord,
  actualOutcome: string
): number {
  // Base score starts at 2 (partially correct)
  let score = 2;
  
  // Extract key information from the prediction and actual outcome
  const predictionLower = prediction.predicted_outcome.toLowerCase();
  const actualLower = actualOutcome.toLowerCase();
  
  // Check if prediction was completely wrong
  if (
    (actualLower.includes("did not happen") || 
     actualLower.includes("completely incorrect") ||
     actualLower.includes("entirely wrong")) &&
    !actualLower.includes("partially")
  ) {
    return 1; // Completely wrong
  }
  
  // Check if prediction was completely right
  if (
    (actualLower.includes("exactly as predicted") || 
     actualLower.includes("completely accurate") ||
     actualLower.includes("fully correct")) &&
    !actualLower.includes("partially")
  ) {
    return 3; // Completely right
  }
  
  // Category-specific scoring adjustments
  switch(prediction.category as PredictionCategory) {
    case 'economy':
      // Economic predictions are judged more strictly due to available data
      if (actualLower.includes("off by more than 10%") || 
          actualLower.includes("significantly overestimated") ||
          actualLower.includes("significantly underestimated")) {
        score = 1;
      } else if (actualLower.includes("within 5%") || 
                actualLower.includes("very accurate") ||
                actualLower.includes("closely predicted")) {
        score = 3;
      }
      break;
      
    case 'politics':
      // Political predictions focus on outcomes and timing
      if (actualLower.includes("wrong outcome") || 
          actualLower.includes("incorrect winner") ||
          actualLower.includes("opposite happened")) {
        score = 1;
      } else if (actualLower.includes("correct outcome") && 
                actualLower.includes("timing was accurate")) {
        score = 3;
      }
      break;
      
    case 'technology':
      // Technology predictions allow more leeway on timing but focus on direction
      if (actualLower.includes("wrong direction") || 
          actualLower.includes("technology failed") ||
          actualLower.includes("never materialized")) {
        score = 1;
      } else if (actualLower.includes("correct direction") && 
                !actualLower.includes("timing was off")) {
        score = 3;
      }
      break;
      
    case 'foreign-policy':
      // Foreign policy predictions focus on outcomes and key players
      if (actualLower.includes("completely misread") || 
          actualLower.includes("wrong actors") ||
          actualLower.includes("opposite response")) {
        score = 1;
      } else if (actualLower.includes("correctly identified") && 
                actualLower.includes("accurate assessment")) {
        score = 3;
      }
      break;
      
    case 'social-trends':
      // Social trends allow more leeway as they're harder to predict precisely
      if (actualLower.includes("trend moved opposite") || 
          actualLower.includes("completely misread public sentiment")) {
        score = 1;
      } else if (actualLower.includes("trend developed as predicted") && 
                !actualLower.includes("overestimated")) {
        score = 3;
      }
      break;
  }
  
  return score;
}

// Function to normalize scores based on prediction category
export function normalizeScore(score: number, category: PredictionCategory): number {
  // Different categories have different difficulty levels for prediction
  const categoryDifficulty: Record<PredictionCategory, number> = {
    'economy': 0.9, // Economic predictions are harder (more precise data available)
    'politics': 0.8,
    'technology': 0.7, // Technology predictions are more difficult
    'foreign-policy': 0.75,
    'social-trends': 0.6 // Social trends are the most difficult to predict precisely
  };
  
  // Normalize the score based on category difficulty
  return score * categoryDifficulty[category];
}

// Function to retrieve past predictions for SIPPs from Supabase
export async function fetchSippPredictions(sippName: string): Promise<any[]> {
  try {
    // First try to fetch from Supabase
    const { data: sipp } = await supabase
      .from('sipps')
      .select('id')
      .eq('name', sippName)
      .single();
    
    if (sipp?.id) {
      const { data: predictions, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('sipp_id', sipp.id)
        .order('date_stated', { ascending: false });
      
      if (predictions && predictions.length > 0) {
        console.log(`Found ${predictions.length} predictions in Supabase for ${sippName}`);
        return predictions.map(p => ({
          id: p.id,
          dateStated: p.date_stated,
          predictedOutcome: p.predicted_outcome,
          category: p.category,
          timeframe: p.timeframe,
          verificationStatus: p.verification_status,
          actualOutcome: p.actual_outcome,
          accuracyRating: p.accuracy_rating,
          normalizedScore: p.normalized_score
        }));
      }
      
      if (error) {
        console.error("Error fetching predictions from Supabase:", error);
      }
    }
    
    // If no data in Supabase, fall back to OpenAI
    console.log(`Generating predictions with OpenAI for ${sippName}`);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that helps analyze predictions made by public figures. Generate realistic predictions that this person likely made in the past."
        },
        {
          role: "user", 
          content: `Generate 40 realistic past predictions that ${sippName} likely made in news articles, interviews, social media, or other public sources. For each prediction:
          1. Include a realistic date it was stated (between 2018-2023)
          2. Write the exact prediction as they might have stated it
          3. Assign a category (economy, politics, technology, foreign-policy, or social-trends)
          4. Include a timeframe for when the prediction was supposed to occur
          5. Indicate whether the prediction came true or not
          6. Describe what actually happened (the actual outcome)
          7. Assign an accuracy rating from 1-3 (1=incorrect, 2=partially correct, 3=fully correct)
          
          Format your response as a JSON object with a "predictions" array.`
        }
      ],
      response_format: { type: "json_object" },
    });
    
    // Extract the JSON data from the response
    const content = response.choices[0].message.content;
    if (!content) return [];
    
    try {
      const jsonData = JSON.parse(content);
      const predictions = jsonData.predictions || [];
      
      // If we have a SIPP id, store these in Supabase for future use
      if (sipp?.id && predictions.length > 0) {
        console.log(`Storing ${predictions.length} OpenAI predictions in Supabase for ${sippName}`);
        
        // Prepare the records for insertion
        const supabasePredictions = predictions.map((p: any, index: number) => ({
          id: `pred-${sipp.id}-${index}`,
          sipp_id: sipp.id,
          date_stated: p.dateStated || p.date || new Date().toISOString().split('T')[0],
          predicted_outcome: p.prediction || p.predictedOutcome,
          category: p.category,
          timeframe: p.timeframe || "unknown",
          verification_status: p.verificationStatus || "verified",
          actual_outcome: p.actualOutcome || p.outcome || "Outcome not verified",
          accuracy_rating: Number(p.accuracyRating) || 2.0,
          normalized_score: Number(p.normalizedScore) || (Number(p.accuracyRating) * 0.3) || 0.6
        }));
        
        // Insert in batches to avoid payload size limits
        const batchSize = 10;
        for (let i = 0; i < supabasePredictions.length; i += batchSize) {
          const batch = supabasePredictions.slice(i, i + batchSize);
          const { error } = await supabase.from('predictions').upsert(batch);
          if (error) console.error("Error storing predictions batch in Supabase:", error);
        }
        
        // Also update the analysis
        await generateAndStorePatternAnalysis(sipp.id, sippName, predictions);
      }
      
      return predictions;
    } catch (parseError) {
      console.error("Error parsing prediction JSON:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return [];
  }
}

// Generate and store pattern analysis
async function generateAndStorePatternAnalysis(sippId: string, sippName: string, predictions: any[]) {
  try {
    // Generate pattern analysis using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that analyzes prediction patterns for public figures."
        },
        {
          role: "user", 
          content: `Based on the following predictions made by ${sippName}, analyze their prediction patterns and biases. Here are their predictions: ${JSON.stringify(predictions.slice(0, 10))}.
          
          Please provide a concise analysis (max 150 words) of:
          1. Their prediction strengths and weaknesses
          2. Category-specific trends
          3. Any biases in their prediction style
          4. Overall accuracy patterns`
        }
      ],
    });
    
    const patternAnalysis = response.choices[0].message.content || 
      "Analysis shows mixed prediction accuracy with notable strengths in their areas of expertise.";
    
    // Store in Supabase
    const { error } = await supabase
      .from('sipps')
      .update({ pattern_analysis: patternAnalysis })
      .eq('id', sippId);
      
    if (error) {
      console.error("Error storing pattern analysis in Supabase:", error);
    }
    
    return patternAnalysis;
  } catch (error) {
    console.error("Error generating pattern analysis:", error);
    return "Analysis shows mixed prediction accuracy with notable strengths in their areas of expertise.";
  }
}

// Calculate category averages and store in Supabase
export async function updateSippAccuracy(sippId: string) {
  try {
    // Get all verified predictions for this SIPP
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('sipp_id', sippId)
      .eq('verification_status', 'verified');
      
    if (error) {
      console.error("Error fetching predictions for accuracy calculation:", error);
      return;
    }
    
    if (!predictions || predictions.length === 0) {
      console.log(`No verified predictions found for SIPP ${sippId}`);
      return;
    }
    
    // Calculate overall average
    const overallSum = predictions.reduce((sum, p) => sum + (p.accuracy_rating || 0), 0);
    const overallAvg = overallSum / predictions.length;
    
    // Update the SIPP record
    const { error: updateError } = await supabase
      .from('sipps')
      .update({ average_accuracy: overallAvg })
      .eq('id', sippId);
      
    if (updateError) {
      console.error("Error updating SIPP average accuracy:", updateError);
    }
    
    // Calculate and update category accuracies
    const categories = ['economy', 'politics', 'technology', 'foreign-policy', 'social-trends'];
    
    for (const category of categories) {
      const catPredictions = predictions.filter(p => p.category === category);
      
      if (catPredictions.length > 0) {
        const catSum = catPredictions.reduce((sum, p) => sum + (p.accuracy_rating || 0), 0);
        const catAvg = catSum / catPredictions.length;
        
        // Update category accuracy
        const { error: catError } = await supabase
          .from('category_accuracies')
          .upsert({
            sipp_id: sippId,
            category: category.replace('-', '_'),
            accuracy: catAvg
          }, { onConflict: 'sipp_id, category' });
          
        if (catError) {
          console.error(`Error updating ${category} accuracy for SIPP ${sippId}:`, catError);
        }
      }
    }
    
    console.log(`Successfully updated accuracy metrics for SIPP ${sippId}`);
  } catch (error) {
    console.error("Error in updateSippAccuracy:", error);
  }
}
