
-- Create tables function for sipps
CREATE OR REPLACE FUNCTION create_sipps_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sipps') THEN
    CREATE TABLE public.sipps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      photo_url TEXT,
      short_bio TEXT,
      average_accuracy NUMERIC(3,1) DEFAULT 2.0,
      pattern_analysis TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Add RLS policies for sipps table
    ALTER TABLE public.sipps ENABLE ROW LEVEL SECURITY;
    
    -- Allow anonymous read access
    CREATE POLICY "Allow anonymous read access"
      ON public.sipps
      FOR SELECT
      TO anon
      USING (true);
      
    -- Allow authenticated users full access
    CREATE POLICY "Allow authenticated users full access"
      ON public.sipps
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create tables function for category_accuracies
CREATE OR REPLACE FUNCTION create_category_accuracies_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'category_accuracies') THEN
    CREATE TABLE public.category_accuracies (
      sipp_id TEXT REFERENCES public.sipps(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      accuracy NUMERIC(3,1) DEFAULT 2.0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      PRIMARY KEY (sipp_id, category)
    );
    
    -- Add RLS policies for category_accuracies table
    ALTER TABLE public.category_accuracies ENABLE ROW LEVEL SECURITY;
    
    -- Allow anonymous read access
    CREATE POLICY "Allow anonymous read access"
      ON public.category_accuracies
      FOR SELECT
      TO anon
      USING (true);
      
    -- Allow authenticated users full access
    CREATE POLICY "Allow authenticated users full access"
      ON public.category_accuracies
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create tables function for predictions
CREATE OR REPLACE FUNCTION create_predictions_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'predictions') THEN
    CREATE TABLE public.predictions (
      id TEXT PRIMARY KEY,
      sipp_id TEXT REFERENCES public.sipps(id) ON DELETE CASCADE,
      date_stated DATE NOT NULL,
      predicted_outcome TEXT NOT NULL,
      category TEXT NOT NULL,
      timeframe TEXT,
      verification_status TEXT NOT NULL DEFAULT 'pending',
      actual_outcome TEXT,
      accuracy_rating NUMERIC(3,1),
      normalized_score NUMERIC(3,2),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Add indexes
    CREATE INDEX idx_predictions_sipp_id ON public.predictions(sipp_id);
    CREATE INDEX idx_predictions_category ON public.predictions(category);
    CREATE INDEX idx_predictions_verification_status ON public.predictions(verification_status);
    
    -- Add RLS policies for predictions table
    ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
    
    -- Allow anonymous read access
    CREATE POLICY "Allow anonymous read access"
      ON public.predictions
      FOR SELECT
      TO anon
      USING (true);
      
    -- Allow authenticated users full access
    CREATE POLICY "Allow authenticated users full access"
      ON public.predictions
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;
