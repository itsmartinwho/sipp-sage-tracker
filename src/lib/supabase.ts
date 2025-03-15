
import { createClient } from '@supabase/supabase-js';

// These environment variables are automatically available when using Lovable's Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types reflecting our Supabase schema
export type SippRecord = {
  id: string;
  name: string;
  photo_url: string;
  short_bio: string;
  average_accuracy: number;
  pattern_analysis: string;
  created_at?: string;
}

export type CategoryAccuracyRecord = {
  sipp_id: string;
  category: string;
  accuracy: number;
  created_at?: string;
}

export type PredictionRecord = {
  id: string;
  sipp_id: string;
  date_stated: string;
  predicted_outcome: string;
  category: string;
  timeframe: string;
  verification_status: 'verified' | 'pending' | 'unverified';
  actual_outcome?: string;
  accuracy_rating?: number;
  normalized_score?: number;
  created_at?: string;
}

export async function setupDatabase() {
  // Create sipps table if it doesn't exist
  const { error: sippsError } = await supabase.rpc('create_sipps_table_if_not_exists');
  if (sippsError) console.error('Error creating sipps table:', sippsError);
  
  // Create category_accuracies table if it doesn't exist
  const { error: catError } = await supabase.rpc('create_category_accuracies_table_if_not_exists');
  if (catError) console.error('Error creating category_accuracies table:', catError);
  
  // Create predictions table if it doesn't exist
  const { error: predError } = await supabase.rpc('create_predictions_table_if_not_exists');
  if (predError) console.error('Error creating predictions table:', predError);
  
  return !sippsError && !catError && !predError;
}
