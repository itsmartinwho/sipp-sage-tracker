
import { supabase, SippRecord, CategoryAccuracyRecord, PredictionRecord } from './supabase';
import { SIPP, Prediction, PredictionCategory } from '@/data/sippData';
import { updateSippAccuracy, fetchSippPredictions } from './utils';

// Format database record to app SIPP type
export async function formatSippRecord(record: SippRecord): Promise<SIPP> {
  // Get category accuracies
  const { data: categoryData } = await supabase
    .from('category_accuracies')
    .select('*')
    .eq('sipp_id', record.id);
    
  // Create category accuracy object
  const categoryAccuracy = {
    economy: 2.0,
    politics: 2.0,
    technology: 2.0,
    foreign_policy: 2.0,
    social_trends: 2.0
  };
  
  // Apply actual category values if available
  if (categoryData && categoryData.length > 0) {
    categoryData.forEach((cat: CategoryAccuracyRecord) => {
      const key = cat.category as keyof typeof categoryAccuracy;
      if (key in categoryAccuracy) {
        categoryAccuracy[key] = cat.accuracy;
      }
    });
  }
  
  // Get predictions
  const { data: predictionData } = await supabase
    .from('predictions')
    .select('*')
    .eq('sipp_id', record.id)
    .order('date_stated', { ascending: false });
    
  // Format predictions
  const predictions: Prediction[] = predictionData?.map((p: PredictionRecord) => ({
    id: p.id,
    dateStated: p.date_stated,
    predictedOutcome: p.predicted_outcome,
    category: p.category as PredictionCategory,
    timeframe: p.timeframe,
    verificationStatus: p.verification_status,
    actualOutcome: p.actual_outcome,
    accuracyRating: p.accuracy_rating,
    normalizedScore: p.normalized_score
  })) || [];
  
  return {
    id: record.id,
    name: record.name,
    photoUrl: record.photo_url,
    shortBio: record.short_bio,
    averageAccuracy: record.average_accuracy,
    categoryAccuracy,
    patternAnalysis: record.pattern_analysis,
    predictions
  };
}

// Get all SIPPs
export async function getAllSipps(): Promise<SIPP[]> {
  try {
    const { data, error } = await supabase
      .from('sipps')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching SIPPs:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('No SIPPs found in database');
      return [];
    }
    
    // Format all SIPP records
    const sipps: SIPP[] = [];
    for (const record of data) {
      const formattedSipp = await formatSippRecord(record);
      sipps.push(formattedSipp);
    }
    
    return sipps;
  } catch (error) {
    console.error('Error in getAllSipps:', error);
    return [];
  }
}

// Get single SIPP by ID
export async function getSippById(id: string): Promise<SIPP | null> {
  try {
    const { data, error } = await supabase
      .from('sipps')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching SIPP ${id}:`, error);
      return null;
    }
    
    if (!data) {
      console.log(`SIPP ${id} not found`);
      return null;
    }
    
    return formatSippRecord(data);
  } catch (error) {
    console.error(`Error in getSippById for ${id}:`, error);
    return null;
  }
}

// Add a new prediction and update accuracy
export async function addPrediction(
  sippId: string, 
  prediction: Omit<PredictionRecord, 'id' | 'sipp_id' | 'created_at'>
): Promise<boolean> {
  try {
    // Create a unique ID for the prediction
    const predictionId = `pred-${sippId}-${Date.now()}`;
    
    // Insert the prediction
    const { error } = await supabase
      .from('predictions')
      .insert({
        id: predictionId,
        sipp_id: sippId,
        ...prediction
      });
      
    if (error) {
      console.error('Error adding prediction:', error);
      return false;
    }
    
    // If this is a verified prediction, update the SIPP accuracy
    if (prediction.verification_status === 'verified' && prediction.accuracy_rating) {
      await updateSippAccuracy(sippId);
    }
    
    return true;
  } catch (error) {
    console.error('Error in addPrediction:', error);
    return false;
  }
}

// Verify a prediction
export async function verifyPrediction(
  predictionId: string,
  actualOutcome: string,
  accuracyRating: number,
  normalizedScore: number
): Promise<boolean> {
  try {
    // Update the prediction
    const { data, error } = await supabase
      .from('predictions')
      .update({
        verification_status: 'verified',
        actual_outcome: actualOutcome,
        accuracy_rating: accuracyRating,
        normalized_score: normalizedScore
      })
      .eq('id', predictionId)
      .select('sipp_id')
      .single();
      
    if (error) {
      console.error('Error verifying prediction:', error);
      return false;
    }
    
    // Update SIPP accuracy
    if (data?.sipp_id) {
      await updateSippAccuracy(data.sipp_id);
    }
    
    return true;
  } catch (error) {
    console.error('Error in verifyPrediction:', error);
    return false;
  }
}

// Sync OpenAI predictions with Supabase
export async function syncSippPredictions(sippName: string): Promise<boolean> {
  try {
    // Get SIPP ID
    const { data: sipp } = await supabase
      .from('sipps')
      .select('id')
      .eq('name', sippName)
      .single();
      
    if (!sipp?.id) {
      console.error(`SIPP ${sippName} not found`);
      return false;
    }
    
    // Fetch fresh predictions from OpenAI
    const predictions = await fetchSippPredictions(sippName);
    
    if (!predictions || predictions.length === 0) {
      console.log(`No predictions fetched for ${sippName}`);
      return false;
    }
    
    // Store predictions
    const supabasePredictions = predictions.map((p: any, index: number) => ({
      id: `pred-${sipp.id}-${Date.now()}-${index}`,
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
    
    // Insert in batches
    const batchSize = 10;
    for (let i = 0; i < supabasePredictions.length; i += batchSize) {
      const batch = supabasePredictions.slice(i, i + batchSize);
      const { error } = await supabase.from('predictions').upsert(batch);
      if (error) {
        console.error("Error storing predictions batch in Supabase:", error);
        return false;
      }
    }
    
    // Update accuracy metrics
    await updateSippAccuracy(sipp.id);
    
    return true;
  } catch (error) {
    console.error('Error in syncSippPredictions:', error);
    return false;
  }
}
