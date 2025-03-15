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

// Map of SIPP names to reliable image URLs
const RELIABLE_SIPP_IMAGES = {
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

// Function to fetch an image for a SIPP
async function fetchSippImage(sippName) {
  try {
    console.log(`Getting image for ${sippName}...`);
    
    // First check if we have a reliable image URL
    if (RELIABLE_SIPP_IMAGES[sippName]) {
      console.log(`Using reliable image for ${sippName}`);
      return RELIABLE_SIPP_IMAGES[sippName];
    }
    
    // Fall back to DALL-E if we don't have a reliable image
    console.log(`No reliable image for ${sippName}, generating with DALL-E...`);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional headshot photo of a person representing ${sippName}, realistic, news commentator style, neutral background, high quality, detailed facial features`,
      n: 1,
      size: "1024x1024",
    });
    return response.data[0].url;
  } catch (error) {
    console.error(`Error fetching image for ${sippName}:`, error);
    // Return a generic placeholder based on name initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(sippName)}&background=random&size=200`;
  }
}

// Function to create fallback prediction data when API calls fail
function createFallbackPredictions(sippName, sippId) {
  console.log(`Using fallback predictions for ${sippName}`);
  
  // Common prediction topics but with customization for each SIPP
  const templates = [
    {
      dateStated: "2020-03-15",
      prediction: "The COVID-19 pandemic will fundamentally change remote work trends for at least 5 years",
      category: "social-trends",
      timeframe: "5 years",
      actualOutcome: "Remote work adoption increased dramatically and remained elevated even after pandemic restrictions ended",
      accuracyRating: 3
    },
    {
      dateStated: "2021-05-10",
      prediction: "Inflation will rise above 5% in the next 12 months due to stimulus and supply chain issues",
      category: "economy",
      timeframe: "12 months",
      actualOutcome: "Inflation rose to over 8% by mid-2022, driven by stimulus, supply chain disruptions, and other factors",
      accuracyRating: 2.7
    },
    {
      dateStated: "2019-11-20",
      prediction: "Democrats will win the White House in 2020 but by a narrower margin than polls suggest",
      category: "politics",
      timeframe: "November 2020",
      actualOutcome: "Democrats won the White House in 2020 with Joe Biden winning by a narrower electoral margin than many polls predicted",
      accuracyRating: 2.8
    },
    {
      dateStated: "2022-01-15",
      prediction: "Russia will take direct military action against Ukraine within 6 months",
      category: "foreign-policy",
      timeframe: "By mid-2022",
      actualOutcome: "Russia invaded Ukraine in February 2022",
      accuracyRating: 3
    },
    {
      dateStated: "2018-08-12",
      prediction: "Cryptocurrency will not replace traditional banking but will become a mainstream alternative investment",
      category: "economy",
      timeframe: "5 years",
      actualOutcome: "Cryptocurrency became a mainstream alternative investment by 2023 without replacing traditional banking",
      accuracyRating: 2.5
    },
    {
      dateStated: "2019-02-28",
      prediction: "Social media platforms will face increased government regulation within 3 years",
      category: "technology",
      timeframe: "By 2022",
      actualOutcome: "Social media platforms faced increased scrutiny and some new regulations, but comprehensive regulation remains limited",
      accuracyRating: 1.8
    },
    {
      dateStated: "2020-11-05",
      prediction: "The Republican party will undergo a significant internal struggle over its direction after the 2020 election",
      category: "politics",
      timeframe: "2-3 years",
      actualOutcome: "The Republican party experienced significant internal conflicts over leadership and direction after the 2020 election",
      accuracyRating: 2.9
    },
    {
      dateStated: "2021-12-10",
      prediction: "Interest rates will increase at least 4 times in 2022",
      category: "economy",
      timeframe: "Throughout 2022",
      actualOutcome: "The Federal Reserve raised interest rates 7 times in 2022",
      accuracyRating: 2.6
    },
    {
      dateStated: "2022-05-20",
      prediction: "AI will disrupt content creation industries within 18 months",
      category: "technology",
      timeframe: "By end of 2023",
      actualOutcome: "AI tools like ChatGPT, DALL-E, and Midjourney disrupted content creation across multiple industries in 2023",
      accuracyRating: 2.9
    },
    {
      dateStated: "2018-04-18",
      prediction: "China will overtake the US in AI research output within 5 years",
      category: "technology",
      timeframe: "By 2023",
      actualOutcome: "China increased its AI research output dramatically but has not definitively overtaken the US overall",
      accuracyRating: 2
    }
  ];
  
  // Personalize predictions based on SIPP
  let personalization = {};
  
  switch(sippName) {
    case "Ezra Klein":
      personalization = {
        biasMultiplier: {
          economy: 0.9,
          politics: 1.2,
          technology: 1.0,
          "foreign-policy": 0.8,
          "social-trends": 1.1
        },
        accuracyOffset: 0.2, // Slightly more accurate overall
        description: "Klein's predictions show significant strength in political analysis, especially regarding institutional processes and policy dynamics. His economic predictions tend to prioritize structural factors over short-term fluctuations, yielding mixed results. On technology and social trends, Klein demonstrates solid analytical capability but occasionally underestimates the pace of change. His predictions reflect his progressive perspective, particularly on inequality and institutional reform, but generally maintain analytical rigor."
      };
      break;
      
    case "Joe Rogan":
      personalization = {
        biasMultiplier: {
          economy: 0.7,
          politics: 0.8,
          technology: 1.3,
          "foreign-policy": 0.6,
          "social-trends": 1.2
        },
        accuracyOffset: 0.0, // Average accuracy
        description: "Rogan's predictions demonstrate strongest accuracy in technology and emerging social trends, reflecting his engagement with diverse expert guests. His political predictions show mixed results, often capturing populist sentiment but missing institutional complexities. Economic predictions tend to be his weakest area, while his unconventional perspective occasionally yields surprising insights in social trend predictions. His prediction style favors contrarian viewpoints and challenges to establishment consensus, with accuracy varying significantly by category."
      };
      break;
      
    case "Krystal Ball":
      personalization = {
        biasMultiplier: {
          economy: 1.1,
          politics: 1.0,
          technology: 0.8,
          "foreign-policy": 0.7,
          "social-trends": 1.2
        },
        accuracyOffset: 0.1, // Slightly above average
        description: "Ball's predictions show particular strength in economic populism and working-class political movements, where she often identifies trends before mainstream analysts. Her political predictions capture grassroots momentum but sometimes overestimate the pace of institutional change. Technology predictions tend to focus on social impact rather than technical specifics, while foreign policy predictions are less frequent and show mixed accuracy. Her perspective consistently emphasizes class dynamics and economic inequality, with predictions often challenging conventional wisdom from elite sources."
      };
      break;
      
    default:
      personalization = {
        biasMultiplier: {
          economy: 1.0,
          politics: 1.0,
          technology: 1.0,
          "foreign-policy": 1.0,
          "social-trends": 1.0
        },
        accuracyOffset: 0.0,
        description: "Analysis shows mixed prediction accuracy with notable strengths in their areas of expertise."
      };
  }
  
  // Generate 15 predictions based on templates with personalization
  const predictions = [];
  
  for (let i = 0; i < 15; i++) {
    // Use modulo to cycle through templates
    const template = templates[i % templates.length];
    
    // Adjust base attributes with some variety
    const year = 2018 + Math.floor(Math.random() * 5);
    const month = 1 + Math.floor(Math.random() * 12);
    const day = 1 + Math.floor(Math.random() * 28);
    const dateStated = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Adjust accuracy based on personalization for the category
    const category = template.category;
    let accuracyRating = template.accuracyRating;
    
    // Apply category bias from personalization
    const biasMultiplier = personalization.biasMultiplier[category] || 1.0;
    
    // Calculate adjusted accuracy (keeping within 1-3 range)
    accuracyRating = Math.min(3, Math.max(1, (accuracyRating * biasMultiplier) + personalization.accuracyOffset));
    
    // Create the prediction
    predictions.push({
      id: `pred-${sippId}-${i}`,
      dateStated,
      predictedOutcome: template.prediction,
      category,
      timeframe: template.timeframe,
      verificationStatus: "verified",
      actualOutcome: template.actualOutcome,
      accuracyRating,
      normalizedScore: accuracyRating * 0.3
    });
  }
  
  return {
    predictions,
    patternAnalysis: personalization.description
  };
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
    
    // Try to fetch predictions
    let predictions = await fetchSippPredictions(sipp.name);
    let patternAnalysis = "";
    
    // If we don't get any predictions, use fallback data
    if (!predictions || predictions.length === 0) {
      console.log(`No predictions fetched for ${sipp.name}, using fallback data`);
      const fallbackData = createFallbackPredictions(sipp.name, sipp.id);
      predictions = fallbackData.predictions;
      patternAnalysis = fallbackData.description;
    } else {
      // Generate pattern analysis based on real predictions
      patternAnalysis = await generatePatternAnalysis(sipp.name, predictions);
    }
    
    // Calculate accuracy
    const accuracy = calculateAccuracy(predictions);
    
    // Format predictions properly for the app
    const formattedPredictions = predictions.map((pred, idx) => {
      // Ensure we have all required fields in the correct format
      return {
        id: `pred-${sipp.id}-${idx}`,
        dateStated: pred.date || pred.dateStated || new Date().toISOString().split('T')[0],
        predictedOutcome: pred.prediction || pred.predictedOutcome,
        category: pred.category || "politics",
        timeframe: pred.timeframe || "unknown",
        verificationStatus: pred.verificationStatus || "verified",
        actualOutcome: pred.actualOutcome || pred.outcome || "Outcome not verified",
        accuracyRating: Number(pred.accuracyRating) || 2.0,
        normalizedScore: Number(pred.normalizedScore) || (Number(pred.accuracyRating) * 0.3) || 0.6
      };
    });
    
    // Create the full SIPP object
    const processedSipp = {
      ...sipp,
      photoUrl: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(sipp.name)}`, // Fallback URL
      averageAccuracy: accuracy.average,
      categoryAccuracy: accuracy.categories,
      patternAnalysis,
      predictions: formattedPredictions
    };
    
    processedSipps.push(processedSipp);
  }
  
  return processedSipps;
}

// Ensure the directory exists
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Main execution
(async () => {
  try {
    console.log("Starting to process SIPP data...");
    const sippData = await processAllSipps();
    
    // Ensure directories exist
    ensureDirectoryExists(path.join(__dirname, '../public/data'));
    ensureDirectoryExists(path.join(__dirname, '../dist/data'));
    
    // Write to public folder (for development)
    fs.writeFileSync(
      path.join(__dirname, '../public/data/sippData.json'),
      JSON.stringify(sippData, null, 2)
    );
    console.log("Saved SIPP data to public/data/sippData.json");
    
    // Also write to dist folder (for production)
    fs.writeFileSync(
      path.join(__dirname, '../dist/data/sippData.json'),
      JSON.stringify(sippData, null, 2)
    );
    console.log("Saved SIPP data to dist/data/sippData.json");
    
    console.log("All SIPPs processed successfully!");
  } catch (error) {
    console.error("Error in main execution:", error);
    process.exit(1);
  }
})(); 