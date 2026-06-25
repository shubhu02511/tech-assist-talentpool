# Tech-Assist TalentPool

This is an AI-powered **Talent Pool Search** web application built as a take-home assignment for the **Application Support Engineer** role at **Tech-Assist**. 

🔗 **Live URL:** [https://master.daxb91yzeols.amplifyapp.com/](https://master.daxb91yzeols.amplifyapp.com/)

It enables recruiters to upload multiple resumes, extracts text locally, scrubs PII via server-side Regex, uses Gemini AI to structure professional attributes, saves details to a database, and provides a search and filter directory.

---

## 🚀 Quick Start (Local Setup)

Follow these simple steps to run and test the project locally.

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Test Data (28 Resumes)
We have provided a script that programmatically generates 28 realistic fake candidate resumes (PDFs) with varying roles, experiences, and locations.
```bash
node scripts/generate_resumes.js
```
The resumes will be generated in a folder named `test_resumes/` in the project root.

### 3. Parse and Seed the Database
You can automatically parse all 28 resumes, run the PII scrubbing pipeline, and seed your database in one command:
```bash
node scripts/parse_test_resumes.js
```
*Note: If no Supabase credentials are configured, this script will automatically create a local `mock_db.json` database in the root. The application reads and writes to this file, making it fully functional immediately.*

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
*   **Upload Page (`/`):** Drag and drop your generated resumes (from `test_resumes/`) or upload new ones. Observe the live status indicators for text extraction, scrubbing, and AI parsing.
*   **Search Page (`/search`):** Search, filter, and slide open detailed candidate profiles (combining contact info, skills, and scrubbed history).

---

## 🔑 Environment Variables Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure the following credentials to connect live APIs:
```ini
# Supabase Database Credentials
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Gemini AI Key (Google AI Studio)
# Get a key from https://aistudio.google.com/
GEMINI_API_KEY=your-gemini-api-key
```
*If keys are omitted or set to placeholder values, the app runs in **Offline/Local mode**, using regex heuristics for local text matching and writing candidate profiles to `mock_db.json` in the root.*

---

## 🔒 PII Scrubbing Workflow

To ensure data privacy before sending content to AI models:
1.  **Regex Extraction:** The server extracts Name, Email, Phone, and LinkedIn URLs using custom regular expressions on the raw text.
2.  **Scrubbing:** All matching PII details are replaced in the raw text with standard placeholders: `[EMAIL]`, `[PHONE]`, `[LINKEDIN]`, `[GITHUB]`.
3.  **AI Analysis:** Only the scrubbed text is sent to Gemini AI to structure skills, years of experience, current job title, and location.
4.  **Secure Merge:** The final candidate entry binds the regex-extracted contact details with the AI-extracted professional attributes in the database.

---

## 📂 Submission Write-ups
*   **Part 1 Note (Product Review):** Read [PRODUCT_FEEDBACK.md](file:///c:/Users/shubham%20chaurasiya/Desktop/techassits/PRODUCT_FEEDBACK.md) for our review of the Neuf ATS trial application.
*   **Part 2 Writeup (Implementation):** Read [WRITEUP.md](file:///c:/Users/shubham%20chaurasiya/Desktop/techassits/WRITEUP.md) for architectural details, AI model selection, and next-step recommendations.
