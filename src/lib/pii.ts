// Regex patterns for contact details
export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Matches most phone formats: e.g., +1 555-555-5555, (555) 555-5555, 555-555-5555, 555.555.5555, +91 9876543210
export const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

// Matches LinkedIn profile URLs
export const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/gi;

// Matches GitHub profile URLs
export const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/gi;

/**
 * Extracts candidate name from the raw resume text.
 * Usually, the name is one of the first non-empty lines, consisting of 2-3 capitalized words,
 * and doesn't contain keywords like "resume", "email", or numbers.
 */
export function extractName(text: string): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Pass 1: Look for 2-4 capitalized words in the first 6 lines
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    const words = line.split(/\s+/);
    
    // Ignore lines that look like a header/label or contain numbers/symbols
    if (
      words.length >= 2 &&
      words.length <= 4 &&
      words.every((w) => /^[A-Z][a-zA-Z'-]*$/.test(w)) &&
      !/resume|cv|curriculum|profile|contact|portfolio|page|address|email|phone/i.test(line)
    ) {
      return line;
    }
  }

  // Pass 2: Look for any line under 35 chars in the first 3 lines that has no digits or @
  for (let i = 0; i < Math.min(lines.length, 3); i++) {
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

/**
 * Extracts the first email address found in the text.
 */
export function extractEmail(text: string): string | null {
  const matches = text.match(EMAIL_REGEX);
  return matches && matches.length > 0 ? matches[0] : null;
}

/**
 * Extracts the first phone number found in the text.
 */
export function extractPhone(text: string): string | null {
  const matches = text.match(PHONE_REGEX);
  return matches && matches.length > 0 ? matches[0] : null;
}

/**
 * Extracts the first LinkedIn URL found in the text.
 */
export function extractLinkedIn(text: string): string | null {
  const matches = text.match(LINKEDIN_REGEX);
  return matches && matches.length > 0 ? matches[0] : null;
}

/**
 * Scrubs all PII (email, phone, LinkedIn, GitHub) from the text,
 * replacing them with standard placeholders.
 */
export function scrubPII(text: string): string {
  let scrubbed = text;
  
  // Replace emails
  scrubbed = scrubbed.replace(EMAIL_REGEX, '[EMAIL]');
  
  // Replace LinkedIn URLs
  scrubbed = scrubbed.replace(LINKEDIN_REGEX, '[LINKEDIN]');
  
  // Replace GitHub URLs
  scrubbed = scrubbed.replace(GITHUB_REGEX, '[GITHUB]');
  
  // Replace phone numbers
  scrubbed = scrubbed.replace(PHONE_REGEX, '[PHONE]');
  
  return scrubbed;
}
