import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedDetails {
  skills: string[];
  experienceYears: number;
  jobTitle: string;
  location: string;
}

/**
 * Extracts structured professional data from scrubbed resume text using Gemini AI.
 * If no API key is provided, it falls back to a smart local parser for offline testing.
 */
export async function extractDetailsWithAI(scrubbedText: string): Promise<ExtractedDetails> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key') {
    console.warn('GEMINI_API_KEY not configured. Falling back to local mock parser.');
    return getFallbackExtraction(scrubbedText);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
      You are an expert AI resume parser. Read the following scrubbed resume text and extract the candidate's professional details.
      The contact details (names, emails, phones, social links) have been scrubbed and replaced with placeholders like [EMAIL] and [PHONE]. Do not try to extract contact details.
      
      Extract the following fields and return them strictly in JSON format matching the schema below:
      
      JSON schema:
      {
        "skills": string[] (a list of core professional skills, tools, languages, and competencies found in the text),
        "experienceYears": number (estimate the total years of professional working experience as a number or decimal based on the timeline. If not specified, default to 0),
        "jobTitle": string (the candidate's most recent or current job title. If none, guess based on experience),
        "location": string (the candidate's current city/state/country if mentioned, otherwise write "Remote")
      }
      
      Scrubbed Resume Text:
      """
      ${scrubbedText}
      """
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON response
    const parsedData = JSON.parse(responseText.trim());

    return {
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      experienceYears: typeof parsedData.experienceYears === 'number' ? parsedData.experienceYears : 0,
      jobTitle: typeof parsedData.jobTitle === 'string' ? parsedData.jobTitle : 'Professional',
      location: typeof parsedData.location === 'string' ? parsedData.location : 'Remote',
    };
  } catch (error) {
    console.error('Error with Gemini AI extraction:', error);
    // Fall back to mock rather than failing the process entirely
    return getFallbackExtraction(scrubbedText);
  }
}

/**
 * A regex-based mock parser to extract professional details from text when offline.
 */
function getFallbackExtraction(text: string): ExtractedDetails {
  const commonSkills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'SQL', 'Project Management', 
    'UI/UX Design', 'Sales', 'Customer Support', 'Marketing', 'HTML', 'CSS', 'AWS', 
    'Docker', 'Kubernetes', 'Git', 'Agile', 'Figma', 'Go', 'C++', 'C#', 'JavaScript', 
    'Communication', 'Analytics'
  ];
  
  // Extract skills by scanning common terms, safely escaping regex characters
  const skills = commonSkills.filter((skill) => {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // If the skill ends with a non-word char (like C++ or C#), we shouldn't use \b at the end.
    const pattern = /^[A-Za-z0-9]/.test(skill) 
      ? (/[A-Za-z0-9]$/.test(skill) ? `\\b${escaped}\\b` : `\\b${escaped}`)
      : escaped;
    return new RegExp(pattern, 'i').test(text);
  });

  // Guess job title
  let jobTitle = 'Professional';
  if (/developer|engineer|programmer|software/i.test(text)) {
    if (/senior|lead|principal|sr/i.test(text)) {
      jobTitle = 'Senior Software Engineer';
    } else if (/junior|jr|intern/i.test(text)) {
      jobTitle = 'Junior Software Engineer';
    } else {
      jobTitle = 'Software Engineer';
    }
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

  // Guess experience years
  let experienceYears = 2.0;
  const expMatches = [...text.matchAll(/(\d+(?:\.\d+)?)\+?\s*years?/gi)];
  if (expMatches.length > 0) {
    // Find the largest number of years mentioned or average them
    const years = expMatches.map(m => parseFloat(m[1])).filter(y => y < 45);
    if (years.length > 0) {
      experienceYears = Math.max(...years);
    }
  } else {
    if (/senior|lead|principal/i.test(text)) experienceYears = 6.0;
    else if (/junior|intern/i.test(text)) experienceYears = 1.0;
  }

  // Guess location
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

  return {
    skills: skills.length > 0 ? skills : ['Problem Solving', 'Teamwork'],
    experienceYears,
    jobTitle,
    location,
  };
}
