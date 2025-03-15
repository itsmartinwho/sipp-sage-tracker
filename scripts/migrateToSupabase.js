
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('Creating tables if they don\'t exist...');
  
  // Create sipps table
  const { error: sippsError } = await supabase.rpc('create_sipps_table_if_not_exists');
  if (sippsError) {
    console.error('Error creating sipps table:', sippsError);
    return false;
  }
  
  // Create category_accuracies table
  const { error: catError } = await supabase.rpc('create_category_accuracies_table_if_not_exists');
  if (catError) {
    console.error('Error creating category_accuracies table:', catError);
    return false;
  }
  
  // Create predictions table
  const { error: predError } = await supabase.rpc('create_predictions_table_if_not_exists');
  if (predError) {
    console.error('Error creating predictions table:', predError);
    return false;
  }
  
  console.log('All tables created successfully');
  return true;
}

async function migrateDataToSupabase() {
  try {
    // First check if tables exist and create them if needed
    const tablesCreated = await createTables();
    if (!tablesCreated) {
      console.error('Error creating tables. Migration aborted.');
      return;
    }
    
    // Load SIPP data from JSON file
    const dataPath = path.join(__dirname, '../public/data/sippData.json');
    console.log(`Loading data from ${dataPath}`);
    
    if (!fs.existsSync(dataPath)) {
      console.error('sippData.json not found! Run preloadData.cjs first.');
      return;
    }
    
    const sippData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`Loaded ${sippData.length} SIPPs to migrate`);
    
    // Process each SIPP
    for (const sipp of sippData) {
      console.log(`Processing ${sipp.name}...`);
      
      // Insert SIPP record
      const { error: sippError } = await supabase
        .from('sipps')
        .upsert({
          id: sipp.id,
          name: sipp.name,
          photo_url: sipp.photoUrl,
          short_bio: sipp.shortBio,
          average_accuracy: sipp.averageAccuracy,
          pattern_analysis: sipp.patternAnalysis
        }, { onConflict: 'id' });
      
      if (sippError) {
        console.error(`Error inserting SIPP ${sipp.name}:`, sippError);
        continue;
      }
      
      // Insert category accuracies
      const categoryEntries = Object.entries(sipp.categoryAccuracy);
      for (const [category, accuracy] of categoryEntries) {
        const { error: catError } = await supabase
          .from('category_accuracies')
          .upsert({
            sipp_id: sipp.id,
            category: category, 
            accuracy: accuracy
          }, { onConflict: 'sipp_id, category' });
        
        if (catError) {
          console.error(`Error inserting category ${category} for ${sipp.name}:`, catError);
        }
      }
      
      // Insert predictions
      for (const prediction of sipp.predictions) {
        const { error: predError } = await supabase
          .from('predictions')
          .upsert({
            id: prediction.id,
            sipp_id: sipp.id,
            date_stated: prediction.dateStated,
            predicted_outcome: prediction.predictedOutcome,
            category: prediction.category,
            timeframe: prediction.timeframe,
            verification_status: prediction.verificationStatus,
            actual_outcome: prediction.actualOutcome,
            accuracy_rating: prediction.accuracyRating,
            normalized_score: prediction.normalizedScore
          }, { onConflict: 'id' });
        
        if (predError) {
          console.error(`Error inserting prediction ${prediction.id} for ${sipp.name}:`, predError);
        }
      }
      
      console.log(`Completed migration for ${sipp.name}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateDataToSupabase();
