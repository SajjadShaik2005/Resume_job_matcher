# AI Resume–Job Matcher (India-Focused)

An AI-assisted web application that analyzes how well a resume matches a given job description and provides a detailed match score, breakdown, and improvement suggestions.

This project is tailored specifically for the Indian job market, accounting for common patterns like CTC (LPA), notice periods, fresher roles, and service-based company experience.

---

## 🚀 Features

- 🔍 Skill extraction with normalization (e.g., Python, React, ML, Cloud)
- 📊 Match score using a weighted combination of:
  - Keyword overlap
  - Semantic similarity
  - Rule-based evaluation
- 🇮🇳 India-specific parsing:
  - CTC (LPA)
  - Notice period
  - Fresher vs experienced roles
  - Service-based company context
- 🧠 Detailed analysis:
  - Matched skills
  - Missing skills
  - Strengths and gaps
- 💡 Actionable suggestions to improve resume match & ATS performance
- ⚡ Interactive UI with real-time feedback

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS
- **Logic**: JavaScript (rule-based + NLP-style text processing)
- **Icons**: Lucide React

---

## 🧩 How It Works

1. User pastes resume text and job description
2. Application extracts:
   - Skills
   - Experience (years)
   - Indian hiring signals (CTC, notice period, fresher keywords)
3. Scores are calculated using:
   - Keyword match (30%)
   - Semantic similarity via word overlap (50%)
   - Rule-based adjustments (20%)
4. Final output includes:
   - Overall match score
   - Score breakdown
   - Skill gaps
   - Resume improvement recommendations

---

## 📌 Why This Project

Most resume matchers are generic and fail to reflect real hiring practices in India.  
This project was built to bridge that gap by combining practical heuristics with lightweight AI-style text analysis.

---

## 🤖 Use of AI Tools (Transparency)

The project idea, problem definition, feature design, and logic flow were defined by me.  
AI tools (Claude / ChatGPT) were used as coding assistants to accelerate development, refactor logic, and improve UI — similar to how modern engineers use AI in real-world workflows.

---

## 📈 Future Improvements

- True embedding-based semantic similarity
- Resume PDF upload & parsing
- Role-specific weighting (intern vs senior)
- ML-based scoring instead of heuristics
- Multi-language resume support

---

## 📷 Demo

*(Add screenshots or a deployed link here if available)*

---

## 🧑‍💻 Author

Built by an AI/ML-focused CSE student exploring applied AI systems, NLP, and real-world hiring problems.
