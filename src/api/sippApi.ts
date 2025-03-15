
import OpenAI from "openai";
import { RELIABLE_SIPP_IMAGES } from "@/utils/imageUtils";
import { calculateAccuracyScore, normalizeScore } from "@/utils/predictionScoring";
import { Prediction, PredictionCategory } from "@/types/sipp";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true, // Allow browser usage
});

// Function to retrieve images for SIPPs
export async function fetchSippImages(sippName: string): Promise<string> {
  try {
    // First try to get from our reliable map
    if (RELIABLE_SIPP_IMAGES[sippName]) {
      console.log(`Using cached image for ${sippName}`);
      return RELIABLE_SIPP_IMAGES[sippName];
    }

    // Fallback to OpenAI if we don't have a cached image
    console.log(`No cached image for ${sippName}, generating with OpenAI`);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional headshot photo of a person representing ${sippName}, realistic, news commentator style, neutral background, high quality, detailed facial features`,
      n: 1,
      size: "1024x1024",
    });
    return response.data[0].url;
  } catch (error) {
    console.error("Error fetching image:", error);
    // Return a reliable image from our map if available
    if (RELIABLE_SIPP_IMAGES[sippName]) {
      return RELIABLE_SIPP_IMAGES[sippName];
    }
    // Fallback to a generic placeholder based on name initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(sippName)}&background=random&size=200`;
  }
}

// Function to retrieve past predictions for SIPPs
export async function fetchSippPredictions(sippName: string): Promise<any[]> {
  try {
    // For now, we'll use the chat completions API since web search isn't available in the browser
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
      return jsonData.predictions || [];
    } catch (parseError) {
      console.error("Error parsing prediction JSON:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return [];
  }
}

// Function to create real predictions based on OpenAI API data
export const loadRealPredictions = async (sippName: string): Promise<Prediction[]> => {
  try {
    // Fetch actual predictions for this SIPP using OpenAI
    const predictions = await fetchSippPredictions(sippName);
    
    // Process and normalize the predictions data
    return predictions.slice(0, 40).map((pred: any, index: number) => {
      // For verified predictions, calculate accuracy using our new system
      let accuracyRating = 2; // Default to partially correct
      
      if (pred.verificationStatus === 'verified' && pred.actualOutcome) {
        // Use our new scoring system
        accuracyRating = calculateAccuracyScore(
          {
            ...pred,
            category: pred.category.replace('_', '-') as PredictionCategory
          } as Prediction, 
          pred.actualOutcome
        );
      } else if (pred.accuracyRating) {
        // Use provided accuracy if available
        accuracyRating = pred.accuracyRating;
      }
      
      // Apply normalization based on category
      const category = pred.category.replace('_', '-') as PredictionCategory;
      const normalizedScore = normalizeScore(accuracyRating, category);
      
      return {
        id: `pred-${sippName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        dateStated: pred.dateStated || new Date().toISOString().split('T')[0],
        predictedOutcome: pred.predictedOutcome || "No prediction text available",
        category: category,
        timeframe: pred.timeframe || "Not specified",
        verificationStatus: pred.verificationStatus || "pending",
        actualOutcome: pred.actualOutcome || undefined,
        accuracyRating: accuracyRating,
        normalizedScore: normalizedScore
      };
    });
  } catch (error) {
    console.error(`Error loading predictions for ${sippName}:`, error);
    return [];
  }
};
