import { NextRequest, NextResponse } from 'next/server';
import { extractText } from '@/lib/extractor';
import { extractName, extractEmail, extractPhone, extractLinkedIn, scrubPII } from '@/lib/pii';
import { extractDetailsWithAI } from '@/lib/gemini';
import { saveCandidate } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 1. Extract text locally
        const rawText = await extractText(buffer, file.type, file.name);

        // 2. Extract PII separately using Regex on raw text (before scrubbing)
        const name = extractName(rawText);
        const email = extractEmail(rawText);
        const phone = extractPhone(rawText);
        const linkedinUrl = extractLinkedIn(rawText);

        // 3. Scrub PII from text
        const scrubbedText = scrubPII(rawText);

        // 4. Send scrubbed text to Gemini to extract skills, experience, title, and location
        const aiDetails = await extractDetailsWithAI(scrubbedText);

        // 5. Save everything to the database
        const candidate = await saveCandidate({
          name: name || file.name.replace(/\.[^/.]+$/, ""), // fallback to filename
          email,
          phone,
          linkedin_url: linkedinUrl,
          job_title: aiDetails.jobTitle,
          location: aiDetails.location,
          experience_years: aiDetails.experienceYears,
          skills: aiDetails.skills,
          scrubbed_text: scrubbedText,
          resume_url: null, // If AWS S3 or Supabase Storage is configured later
        });

        results.push({
          fileName: file.name,
          status: 'success',
          candidate,
        });
      } catch (fileError: any) {
        console.error(`Error processing file ${file.name}:`, fileError);
        results.push({
          fileName: file.name,
          status: 'error',
          error: fileError.message || 'Parsing error.',
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Process API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
