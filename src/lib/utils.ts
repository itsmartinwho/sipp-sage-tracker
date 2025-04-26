import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
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

// Function to retrieve images for SIPPs
export async function fetchSippImages(sippName: string): Promise<string> {
  try {
    // First try to get from our reliable map
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

// Function to retrieve past predictions for SIPPs
export async function fetchSippPredictions(sippName: string): Promise<any[]> {
  try {
    // For now, we'll use the chat completions API since web search isn't available in the browser
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant specializing in analyzing predictions made by public figures. 
          Your task is to generate highly realistic predictions that ${sippName} likely made in the past 2 years (2022-2023).
          
          Important guidelines:
          1. Generate exactly 50 predictions
          2. EACH prediction should be SPECIFIC to ${sippName}'s expertise, background, and known views
          3. Include a mix of broad predictions (e.g., "Russia will decline as a geopolitical power") and specific ones (e.g., "NASDAQ will gain 12% in Q3")
          4. Include realistic dates between January 1, 2022 and December 31, 2023
          5. Distribute predictions across all five categories: economy, politics, technology, foreign-policy, social-trends
          6. For each prediction, estimate whether it came true with realistic outcomes
          7. For metrics-based predictions (with percentages or numbers), include specific variance information in the outcome
          8. Be accurate to ${sippName}'s actual areas of expertise, political leanings, and public statements
          
          DO NOT generate generic predictions that could apply to any person. Each prediction must feel authentically connected to ${sippName}'s actual perspective.`
        },
        {
          role: "user", 
          content: `Generate 50 realistic past predictions that ${sippName} specifically made between January 2022 and December 2023. For each prediction:
          1. Include a realistic date it was stated (between Jan 2022 - Dec 2023)
          2. Write the exact prediction as ${sippName} would have phrased it, matching their communication style
          3. Assign a category (economy, politics, technology, foreign-policy, or social-trends)
          4. Include a timeframe for when the prediction was supposed to occur
          5. Indicate whether the prediction came true or not
          6. Describe what actually happened (the actual outcome) with specific metrics when applicable
          7. Assign an accuracy rating from 1-3 (1=incorrect, 2=partially correct, 3=fully correct)
          
          Make sure to include a mix of:
          - 15 broad conceptual predictions (trends, movements, general directions)
          - 35 specific predictions with measurable outcomes (percentages, numbers, concrete events)
          
          Format your response as a JSON object with a "predictions" array.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8, // Add some variability to get diverse predictions
    });
    
    // Extract the JSON data from the response
    const content = response.choices[0].message.content;
    if (!content) return [];
    
    try {
      const jsonData = JSON.parse(content);
      console.log(`Successfully fetched ${jsonData.predictions?.length || 0} predictions for ${sippName}`);
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
