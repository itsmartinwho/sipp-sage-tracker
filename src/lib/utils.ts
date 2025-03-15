
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import OpenAI from "openai"

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
const RELIABLE_SIPP_IMAGES: Record<string, string> = {
  "Tucker Carlson": "/lovable-uploads/dc4415b9-f384-4c81-b95d-952a1c7c3849.png", // New Tucker Carlson image
  "Rachel Maddow": "https://i.imgur.com/wQ0p9E8.jpg", // Rachel Maddow
  "Elon Musk": "https://i.imgur.com/6Df9vJz.jpg", // Elon Musk
  "Nate Silver": "https://i.imgur.com/vbtMQAe.jpg", // Nate Silver
  "Sean Hannity": "https://i.imgur.com/4Jqi1Sl.jpg", // Sean Hannity
  "Anderson Cooper": "https://i.imgur.com/8syvBG2.jpg", // Anderson Cooper
  "Ben Shapiro": "https://i.imgur.com/z90ufnP.jpg", // Ben Shapiro
  "Ezra Klein": "https://i.imgur.com/UTaJZRd.jpg", // Ezra Klein
  "Joe Rogan": "https://i.imgur.com/UREG0Vp.jpg", // Joe Rogan
  "Krystal Ball": "https://i.imgur.com/nxbvUzV.jpg" // Krystal Ball
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

