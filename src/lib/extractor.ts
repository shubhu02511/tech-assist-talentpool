import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

/**
 * Extracts raw text from a PDF file buffer.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text || '';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to parse PDF file.');
  }
}

/**
 * Extracts raw text from a DOCX file buffer.
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to parse DOCX file.');
  }
}

/**
 * Helper to determine file type and extract text.
 */
export async function extractText(buffer: Buffer, mimeType: string, fileName?: string): Promise<string> {
  const normalizedMime = mimeType.toLowerCase();
  const ext = fileName ? fileName.split('.').pop()?.toLowerCase() : '';

  if (normalizedMime === 'application/pdf' || ext === 'pdf') {
    return extractTextFromPdf(buffer);
  } else if (
    normalizedMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    normalizedMime === 'application/msword' ||
    ext === 'docx' ||
    ext === 'doc'
  ) {
    return extractTextFromDocx(buffer);
  } else {
    // Fallback attempt based on extension if mime type is generic
    if (ext === 'pdf') return extractTextFromPdf(buffer);
    if (ext === 'docx') return extractTextFromDocx(buffer);
    throw new Error(`Unsupported file type: ${mimeType}. Please upload a PDF or DOCX file.`);
  }
}
