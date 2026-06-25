const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse/lib/pdf-parse.js');
const { createClient } = require('@supabase/supabase-js');

// Load env variables if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      env[key] = value;
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your-supabase-project-url' && 
  supabaseAnonKey !== 'your-supabase-anon-key';

const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Regex patterns
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/gi;
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/gi;

function extractName(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return 'Unknown Candidate';

  // Pass 1: Scan first 10 lines for 2-4 capitalized or all-caps words
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    const words = line.split(/\s+/);
    if (
      words.length >= 2 &&
      words.length <= 4 &&
      words.every(w => /^[A-Z][a-zA-Z'-]*$|^[A-Z]+$/.test(w)) &&
      !/resume|cv|curriculum|profile|contact|portfolio|page|address|email|phone/i.test(line)
    ) {
      return line;
    }
  }

  // Pass 2: Anchor Scan. Locate the email/phone contact block in the text.
  let contactLineIndex = -1;
  const emailRegexLocal = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegexLocal = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;

  for (let i = 0; i < lines.length; i++) {
    if (emailRegexLocal.test(lines[i]) || phoneRegexLocal.test(lines[i])) {
      contactLineIndex = i;
      break;
    }
  }

  if (contactLineIndex > 0) {
    // Check up to 2 lines above the contact block
    for (let offset = 1; offset <= 2; offset++) {
      const idx = contactLineIndex - offset;
      if (idx >= 0) {
        const line = lines[idx];
        const words = line.split(/\s+/);
        if (
          words.length >= 2 &&
          words.length <= 4 &&
          words.every(w => /^[A-Z][a-zA-Z'-]*$|^[A-Z]+$/.test(w)) &&
          !/resume|cv|curriculum|profile|contact|portfolio|page|address|email|phone/i.test(line)
        ) {
          return line;
        }
      }
    }
  }

  // Pass 3: Fallback first short line in the first 5 lines (no digits, no @)
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line.length > 3 &&
      line.length < 35 &&
      !/@/.test(line) &&
      !/\d/.test(line) &&
      !/resume|cv|curriculum|email|phone|contact/i.test(line)
    ) {
      return line;
    }
  }

  return 'Candidate ' + Math.floor(1000 + Math.random() * 9000);
}

function extractEmail(text) {
  const m = text.match(EMAIL_REGEX);
  return m ? m[0] : null;
}

function extractPhone(text) {
  const m = text.match(PHONE_REGEX);
  return m ? m[0] : null;
}

function extractLinkedIn(text) {
  const m = text.match(LINKEDIN_REGEX);
  return m ? m[0] : null;
}

function scrubPII(text) {
  return text
    .replace(EMAIL_REGEX, '[EMAIL]')
    .replace(LINKEDIN_REGEX, '[LINKEDIN]')
    .replace(GITHUB_REGEX, '[GITHUB]')
    .replace(PHONE_REGEX, '[PHONE]');
}

// Fallback extractor logic
function getFallbackExtraction(text) {
  const commonSkills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'SQL', 'Project Management', 
    'UI/UX Design', 'Sales', 'Customer Support', 'Marketing', 'HTML', 'CSS', 'AWS', 
    'Docker', 'Kubernetes', 'Git', 'Agile', 'Figma', 'Go', 'C++', 'C#', 'JavaScript', 
    'Communication', 'Analytics'
  ];
  
  // Safe filtering of skills
  const skills = commonSkills.filter((skill) => {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const pattern = /^[A-Za-z0-9]/.test(skill) 
      ? (/[A-Za-z0-9]$/.test(skill) ? `\\b${escaped}\\b` : `\\b${escaped}`)
      : escaped;
    return new RegExp(pattern, 'i').test(text);
  });

  let jobTitle = 'Professional';
  if (/developer|engineer|programmer|software/i.test(text)) {
    if (/senior|lead|principal|sr/i.test(text)) jobTitle = 'Senior Software Engineer';
    else if (/junior|jr|intern/i.test(text)) jobTitle = 'Junior Software Engineer';
    else jobTitle = 'Software Engineer';
  } else if (/designer|ui|ux|creative/i.test(text)) {
    jobTitle = 'UI/UX Designer';
  } else if (/manager|lead|director/i.test(text)) {
    if (/product/i.test(text)) jobTitle = 'Product Manager';
    else if (/project/i.test(text)) jobTitle = 'Project Manager';
    else jobTitle = 'Team Manager';
  } else if (/sales|account|marketing|growth/i.test(text)) {
    jobTitle = 'Sales Executive';
  } else if (/support|customer|success/i.test(text)) {
    jobTitle = 'Customer Support Specialist';
  }

  let experienceYears = 2.0;
  const expMatches = [...text.matchAll(/(\d+(?:\.\d+)?)\+?\s*years?/gi)];
  if (expMatches.length > 0) {
    const years = expMatches.map(m => parseFloat(m[1])).filter(y => y < 45);
    if (years.length > 0) experienceYears = Math.max(...years);
  } else {
    if (/senior|lead|principal/i.test(text)) experienceYears = 6.0;
    else if (/junior|intern/i.test(text)) experienceYears = 1.0;
  }

  let location = 'Remote';
  const locations = [
    'New York', 'San Francisco', 'London', 'Berlin', 'Toronto', 'Chicago', 
    'Seattle', 'Austin', 'Boston', 'Sydney', 'Mumbai', 'Bangalore', 'California', 
    'New Delhi', 'Paris', 'Tokyo'
  ];
  for (const loc of locations) {
    if (new RegExp(`\\b${loc}\\b`, 'i').test(text)) {
      location = loc;
      break;
    }
  }

  return { skills, experienceYears, jobTitle, location };
}

const MOCK_DB_PATH = path.join(__dirname, '..', 'mock_db.json');
const RESUMES_DIR = path.join(__dirname, '..', 'test_resumes');

async function main() {
  if (!fs.existsSync(RESUMES_DIR)) {
    console.error('test_resumes directory does not exist. Run node scripts/generate_resumes.js first.');
    return;
  }

  const files = fs.readdirSync(RESUMES_DIR).filter(f => f.endsWith('.pdf'));
  console.log(`Found ${files.length} resumes to parse and seed...`);

  const mockDbCandidates = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(RESUMES_DIR, file);
    
    try {
      const buffer = fs.readFileSync(filePath);
      const data = await pdf(buffer);
      const rawText = data.text || '';

      const name = extractName(rawText);
      const email = extractEmail(rawText);
      const phone = extractPhone(rawText);
      const linkedinUrl = extractLinkedIn(rawText);
      const scrubbedText = scrubPII(rawText);
      const details = getFallbackExtraction(rawText);

      const candidateData = {
        name,
        email,
        phone,
        linkedin_url: linkedinUrl,
        job_title: details.jobTitle,
        location: details.location,
        experience_years: details.experienceYears,
        skills: details.skills,
        scrubbed_text: scrubbedText,
        resume_url: null,
      };

      if (supabase) {
        // Seed in Supabase
        const { error } = await supabase.from('candidates').insert([candidateData]);
        if (error) console.error(`Error saving ${name} to Supabase:`, error.message);
      }

      // Always populate local mock DB as well
      mockDbCandidates.push({
        ...candidateData,
        id: crypto.randomUUID ? crypto.randomUUID() : `mock-uuid-${i}-${Date.now()}`,
        created_at: new Date().toISOString()
      });

      console.log(`[${i + 1}/${files.length}] Parsed and stored: ${name} (${details.jobTitle})`);
    } catch (e) {
      console.error(`Error parsing file ${file}:`, e.message);
    }
  }

  // Write local mock DB
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(mockDbCandidates, null, 2), 'utf8');
  console.log(`Local mock database seeded at ${MOCK_DB_PATH}`);
  
  if (supabase) {
    console.log('Supabase database seeded successfully.');
  } else {
    console.log('No Supabase credentials detected. Seeding completed locally (mock_db.json).');
  }
}

main();
