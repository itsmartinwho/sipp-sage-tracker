
const fs = require('fs');
const path = require('path');

// Map of SIPP names to reliable image URLs
const RELIABLE_SIPP_IMAGES = {
  "Tucker Carlson": "/lovable-uploads/dc4415b9-f384-4c81-b95d-952a1c7c3849.png", // Tucker Carlson (new image)
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

// Function to fix the images in the sippData.json file
function fixImages() {
  try {
    console.log("Starting to fix SIPP images...");
    
    // Read the existing data file
    const publicDataPath = path.join(__dirname, '../public/data/sippData.json');
    const sippData = JSON.parse(fs.readFileSync(publicDataPath, 'utf8'));
    
    // Update each SIPP's photoUrl
    sippData.forEach(sipp => {
      if (RELIABLE_SIPP_IMAGES[sipp.name]) {
        console.log(`Updating image for ${sipp.name}`);
        sipp.photoUrl = RELIABLE_SIPP_IMAGES[sipp.name];
      } else {
        console.log(`No reliable image for ${sipp.name}, using fallback`);
        sipp.photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(sipp.name)}&size=200&background=random&color=fff&bold=true`;
      }
    });
    
    // Write back to public folder
    fs.writeFileSync(publicDataPath, JSON.stringify(sippData, null, 2));
    console.log("Updated SIPP images in public/data/sippData.json");
    
    // Also update in dist folder if it exists
    const distDataPath = path.join(__dirname, '../dist/data/sippData.json');
    if (fs.existsSync(distDataPath)) {
      fs.writeFileSync(distDataPath, JSON.stringify(sippData, null, 2));
      console.log("Updated SIPP images in dist/data/sippData.json");
    }
    
    console.log("All SIPP images updated successfully!");
  } catch (error) {
    console.error("Error fixing SIPP images:", error);
  }
}

// Run the function
fixImages();
