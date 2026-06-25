# Part 1 Note: Neuf Product Feedback

**Candidate:** Application Support Engineer Applicant  
**Product Reviewed:** Neuf ATS (neuf.engage-ai.tech)

---

## 3 Things That Work Well
1. **Granular AI Resume Scoring (11 Dimensions):** Scoring candidates across 11 key dimensions (instead of a single match score) is highly effective. It allows recruiters to instantly diagnose a candidate's strengths (e.g., technical depth vs. leadership potential) at a glance.
2. **Candidate-Specific Interview Prep:** Automatically generating tailored interview questions based on the candidate's parsed resume history is a massive time-saver for hiring managers, ensuring more structured and relevant conversations.
3. **CV Authenticity & Padding Flagging:** In the modern job market where AI-generated resumes are prevalent, having built-in flags for padding or highly likely AI-generated text is a vital quality control layer for recruiters.

---

## 3 Things That Were Confusing or Felt Broken
1. **AI Score "Black Box":** While the 11-dimension scores are visual and clean, there is a lack of feedback explaining *why* the candidate scored high or low in a specific area. Adding a quick, hoverable AI explanation block would demystify the scores.
2. **Pipeline UI Interactivity Lag:** Moving candidates between pipeline stages (e.g., from Applied to Technical Review) lacks clear instant visual confirmation (like a toast notification or active animation). In fast-paced workflows, this can lead to accidental double-actions.
3. **Contextual Loss of Raw Resume Text:** When viewing candidate details, the AI-structured summaries are great, but there is no quick way to cross-reference the structured data with the original raw resume text in a split view. 

---

## One Thing I'd Build Next
**"Blind Hiring Mode" (Anonymized Screening):**  
I would implement a toggle for a "Blind Hiring" view. When enabled, this mode scrubs the candidate's name, gender markers, profile photo, and graduation years from the profile and scoring dashboard. This enforces unbiased screening in the initial review phases, aligning perfectly with Neuf's AI-first approach to fair and efficient hiring.
