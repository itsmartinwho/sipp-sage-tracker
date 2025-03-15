import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Configuration, OpenAIApi } from "openai"

const openai = new OpenAIApi(new Configuration({
  apiKey: "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",
}));

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date function
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Function to retrieve images for SIPPs
export async function fetchSippImages(sippName: string): Promise<string> {
  try {
    const response = await openai.createImage({
      prompt: `Image of ${sippName}`,
      n: 1,
      size: "256x256",
    });
    return response.data[0].url;
  } catch (error) {
    console.error("Error fetching image:", error);
    return ""; // Return an empty string or a placeholder image URL
  }
}

// Function to retrieve past predictions for SIPPs
export async function fetchSippPredictions(sippName: string): Promise<any[]> {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `List past predictions made by ${sippName} in news and social media.`,
      max_tokens: 1500,
    });
    return JSON.parse(response.data.choices[0].text || "[]");
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return [];
  }
}

