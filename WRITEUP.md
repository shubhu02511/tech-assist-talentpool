# Part 2 Writeup: Talent Pool Search

---

## 1. Architectural Decisions Made
*   **Next.js (TypeScript) & Tailwind CSS v4:** Chosen for rapid frontend/backend development, routing stability, and modern layout design. We utilized Tailwind v4 for modern glassmorphism styling, clean animations, and responsive flex grid overlays.
*   **Local Processing Pipeline:** Resumes are uploaded and parsed completely on the server. The raw text is extracted using `pdf-parse` (for PDF files) and `mammoth` (for DOCX Word files) before any API queries are triggered.
*   **Two-Pass parsing (PII Scrubbing + AI):**
    1.  **Pass 1 (Regex):** Server-side regular expressions scan the raw text to extract Name, Email, Phone, and LinkedIn URLs. These details are stored separately. The text is then scrubbed, replacing all PII with placeholders (`[EMAIL]`, `[PHONE]`, `[LINKEDIN]`, `[GITHUB]`).
    2.  **Pass 2 (AI Extraction):** The clean, scrubbed text is sent to Gemini AI to extract skills, experience years, location, and job title.
*   **Dual Database Adaptor (Zero-Config Testability):** To make the project instantly runnable out-of-the-box, the database adapter connects to **Supabase** if the `.env.local` keys are provided, but automatically falls back to a local file-based database (`mock_db.json`) if they are missing.

---

## 2. AI Model Selection & Rationale
*   **Model Chosen:** `gemini-1.5-flash` (via Google AI Studio SDK).
*   **Why:**
    *   **Cost-efficiency:** High-performance features available on the free tier.
    *   **Native Structured Outputs:** Gemini supports setting `responseMimeType: 'application/json'`. This forces the model to return a strict JSON schema, eliminating parsing errors or markdown formatting clutter.
    *   **Fallback Resilience:** We built a local regex-based fallback extractor that takes over if the Gemini API key is missing or rate-limited, ensuring the application remains robust.

---

## 3. What I'd Improve Next
1. **Document Viewer Integration:** Integrate AWS S3 or Supabase Storage to store and display the original PDF document side-by-side with the parsed info.
2. **OCR Parsing:** Add OCR support (e.g., Tesseract.js) to support scanned/image-based resume PDFs.
3. **Advanced PII Heuristics:** Upgrade name and address detection using NLP (Natural Language Processing) tools like compromise.js to capture edge-case international names and mailing addresses.

---

## 4. One Feature to Add (Real Product)
**"Smart Job Matcher" (Relevance Indexing):**  
I would add a field where recruiters can paste a Job Description (JD). The system would run a semantic comparison between the JD and all candidates in the talent pool, scoring them on a relevance scale (0–100%). It would display a ranked list of matches, highlighting "Matched Skills" (in green) and "Missing Skills" (in amber) directly on each candidate card.
