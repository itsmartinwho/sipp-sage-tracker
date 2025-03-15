const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: "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",
});

// SIPP list
const sippList = [
  {
    id: "tucker-carlson",
    name: "Tucker Carlson",
    shortBio: "Conservative political commentator, former Fox News host",
  },
  {
    id: "rachel-maddow",
    name: "Rachel Maddow",
    shortBio: "Progressive political commentator, MSNBC host",
  },
  {
    id: "elon-musk",
    name: "Elon Musk",
    shortBio: "Tech entrepreneur, owner of X/Twitter",
  },
  {
    id: "nate-silver",
    name: "Nate Silver",
    shortBio: "Data journalist, founder of FiveThirtyEight",
  },
  {
    id: "sean-hannity",
    name: "Sean Hannity",
    shortBio: "Conservative political commentator, Fox News host",
  },
  {
    id: "anderson-cooper",
    name: "Anderson Cooper",
    shortBio: "CNN anchor and correspondent",
  },
  {
    id: "ben-shapiro",
    name: "Ben Shapiro",
    shortBio: "Conservative political commentator, founder of The Daily Wire",
  },
  {
    id: "ezra-klein",
    name: "Ezra Klein",
    shortBio: "Liberal political analyst, co-founder of Vox",
  },
  {
    id: "joe-rogan",
    name: "Joe Rogan",
    shortBio: "Podcast host with wide-ranging political discussions",
  },
  {
    id: "krystal-ball",
    name: "Krystal Ball",
    shortBio: "Progressive political commentator, co-host of Breaking Points",
  }
];

// Function to fetch an image for a SIPP
async function fetchSippImage(sippName) {
  try {
    console.log(`Fetching image for ${sippName}...`);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional headshot photo of a person representing ${sippName}, realistic, news commentator style, neutral background, high quality, detailed facial features`,
      n: 1,
      size: "1024x1024",
    });
    return response.data[0].url;
  } catch (error) {
    console.error(`Error fetching image for ${sippName}:`, error);
    return null;
  }
}

// Function to fetch predictions for a SIPP
async function fetchSippPredictions(sippName) {
  try {
    console.log(`Generating predictions for ${sippName}...`);
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
    
    const content = response.choices[0].message.content;
    if (!content) return [];
    
    try {
      const jsonData = JSON.parse(content);
      return jsonData.predictions || [];
    } catch (parseError) {
      console.error(`Error parsing prediction JSON for ${sippName}:`, parseError);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching predictions for ${sippName}:`, error);
    return [];
  }
}

// Calculate average accuracy and category-specific accuracy
function calculateAccuracy(predictions) {
  if (!predictions || predictions.length === 0) {
    return {
      average: 2.0,
      categories: {
        economy: 2.0,
        politics: 2.0,
        technology: 2.0,
        foreign_policy: 2.0,
        social_trends: 2.0
      }
    };
  }
  
  // Filter only verified predictions with accuracy ratings
  const verifiedPredictions = predictions.filter(p => 
    p.verificationStatus === "verified" && typeof p.accuracyRating === "number"
  );
  
  if (verifiedPredictions.length === 0) return {
    average: 2.0,
    categories: {
      economy: 2.0,
      politics: 2.0,
      technology: 2.0,
      foreign_policy: 2.0,
      social_trends: 2.0
    }
  };
  
  // Calculate overall average
  const totalAccuracy = verifiedPredictions.reduce((sum, p) => sum + p.accuracyRating, 0);
  const averageAccuracy = totalAccuracy / verifiedPredictions.length;
  
  // Calculate by category
  const categories = {
    economy: [],
    politics: [],
    technology: [],
    foreign_policy: [],
    social_trends: []
  };
  
  verifiedPredictions.forEach(p => {
    const category = p.category.replace('-', '_');
    if (categories[category]) {
      categories[category].push(p.accuracyRating);
    }
  });
  
  const categoryAccuracy = {};
  Object.keys(categories).forEach(cat => {
    if (categories[cat].length > 0) {
      const sum = categories[cat].reduce((a, b) => a + b, 0);
      categoryAccuracy[cat] = sum / categories[cat].length;
    } else {
      categoryAccuracy[cat] = 2.0; // Default value
    }
  });
  
  return {
    average: averageAccuracy,
    categories: categoryAccuracy
  };
}

// Generate pattern analysis based on predictions
async function generatePatternAnalysis(sippName, predictions) {
  try {
    console.log(`Generating pattern analysis for ${sippName}...`);
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
    
    return response.choices[0].message.content || 
      "Analysis shows mixed prediction accuracy with notable strengths in their areas of expertise.";
  } catch (error) {
    console.error(`Error generating pattern analysis for ${sippName}:`, error);
    return "Analysis shows mixed prediction accuracy with notable strengths in their areas of expertise.";
  }
}

// Main function to process all SIPPs
async function processAllSipps() {
  const processedSipps = [];
  
  for (const sipp of sippList) {
    console.log(`\nProcessing ${sipp.name}...`);
    
    // Fetch image URL
    const photoUrl = await fetchSippImage(sipp.name);
    
    // Fetch predictions
    const predictions = await fetchSippPredictions(sipp.name);
    
    // Calculate accuracy
    const accuracy = calculateAccuracy(predictions);
    
    // Generate pattern analysis
    const patternAnalysis = await generatePatternAnalysis(sipp.name, predictions);
    
    // Create the full SIPP object
    const processedSipp = {
      ...sipp,
      photoUrl: photoUrl || `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop`, // Fallback URL
      averageAccuracy: accuracy.average,
      categoryAccuracy: accuracy.categories,
      patternAnalysis,
      predictions: predictions.map((pred, idx) => ({
        ...pred,
        id: `pred-${sipp.id}-${idx}`
      }))
    };
    
    processedSipps.push(processedSipp);
    console.log(`Completed processing for ${sipp.name}`);
  }
  
  return processedSipps;
}

// Write the data to a JSON file
async function writeDataToFile() {
  try {
    // Make sure the directory exists
    const scriptsDir = path.join(__dirname);
    const publicDir = path.join(__dirname, '..', 'public', 'data');
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Process all SIPPs
    const processedData = await processAllSipps();
    
    // Write to JSON file
    const outputPath = path.join(publicDir, 'sippData.json');
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));
    
    console.log(`\nData successfully written to ${outputPath}`);
  } catch (error) {
    console.error('Error writing data to file:', error);
    process.exit(1);
  }
}

// Run the script
writeDataToFile().then(() => {
  console.log('Preload script completed successfully.');
}).catch(err => {
  console.error('Error running preload script:', err);
  process.exit(1);
}); 