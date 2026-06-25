import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface Candidate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  job_title: string;
  location: string;
  experience_years: number;
  skills: string[];
  scrubbed_text: string;
  resume_url?: string | null;
  created_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase credentials are configured
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your-supabase-project-url' && 
  supabaseAnonKey !== 'your-supabase-anon-key';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

const isServerless = !!(
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.AWS_EXECUTION_ENV ||
  process.env.VERCEL ||
  process.env.AMPLIFY_BUILD_ID
);

const MOCK_DB_PATH = isServerless
  ? path.join(os.tmpdir(), 'mock_db.json')
  : path.join(process.cwd(), 'mock_db.json');

// Initialize local mock JSON file if it doesn't exist
function initLocalDb() {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const rootDbPath = path.join(process.cwd(), 'mock_db.json');
    if (fs.existsSync(rootDbPath)) {
      try {
        const rootDbContent = fs.readFileSync(rootDbPath, 'utf8');
        fs.writeFileSync(MOCK_DB_PATH, rootDbContent, 'utf8');
      } catch (err) {
        console.error('Failed to copy root mock_db.json to writable location, initializing empty:', err);
        fs.writeFileSync(MOCK_DB_PATH, JSON.stringify([], null, 2), 'utf8');
      }
    } else {
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify([], null, 2), 'utf8');
    }
  }
}

/**
 * Saves a parsed candidate to the database.
 */
export async function saveCandidate(
  candidateData: Omit<Candidate, 'id' | 'created_at'>
): Promise<Candidate> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .insert([candidateData])
        .select()
        .single();

      if (error) throw error;
      return data as Candidate;
    } catch (err) {
      console.error('Supabase insert failed, falling back to local storage:', err);
    }
  }

  // Fallback to local file-based database
  initLocalDb();
  const fileData = fs.readFileSync(MOCK_DB_PATH, 'utf8');
  const candidates: Candidate[] = JSON.parse(fileData);

  const newCandidate: Candidate = {
    ...candidateData,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  candidates.push(newCandidate);
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(candidates, null, 2), 'utf8');
  return newCandidate;
}

/**
 * Retrieves all candidates from the database.
 */
export async function getCandidates(): Promise<Candidate[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Candidate[];
    } catch (err) {
      console.error('Supabase query failed, falling back to local storage:', err);
    }
  }

  // Fallback to local file-based database
  initLocalDb();
  const fileData = fs.readFileSync(MOCK_DB_PATH, 'utf8');
  const candidates: Candidate[] = JSON.parse(fileData);
  
  // Sort by created_at descending
  return candidates.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
