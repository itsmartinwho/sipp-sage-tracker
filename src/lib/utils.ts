
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
  "Tucker Carlson": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tucker_Carlson_2020.jpg",
  "Rachel Maddow": "https://upload.wikimedia.org/wikipedia/commons/d/dc/Rachel_Maddow_in_2008.jpg",
  "Elon Musk": "https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg",
  "Nate Silver": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Nate_Silver_2009.png",
  "Sean Hannity": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Sean_Hannity.jpg",
  "Anderson Cooper": "https://upload.wikimedia.org/wikipedia/commons/5/51/Anderson_Cooper_at_the_Edinburgh_TV_fest.jpg",
  "Ben Shapiro": "https://upload.wikimedia.org/wikipedia/commons/6/62/Ben_Shapiro_2018.jpg",
  "Ezra Klein": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Ezra_Klein_2012_Shankbone.JPG",
  "Joe Rogan": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Joe_Rogan_-_2023_%28cropped%29.jpg",
  "Krystal Ball": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Krystal_Ball_by_Gage_Skidmore.jpg"
};

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

