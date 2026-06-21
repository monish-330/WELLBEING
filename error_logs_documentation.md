# 🛠️ System Engineering: Error Logs & Resolution Documentation

This document compiles the 10 core engineering issues encountered, the prompts used to debug them, the exact code changes implemented, and the final results.

---

### 🚨 ERROR LOG 01: MongoDB Connection Refused (ECONNREFUSED)

* **Problem**: The Express server failed to select a server in MongoDB Atlas and crashed on startup with `MongoServerSelectionError: connect ECONNREFUSED`.
* **Developer Prompt**:
  > "My Express server is crashing on startup trying to connect to MongoDB Atlas with a MongoServerSelectionError. I already generated the cluster and updated the connection string. How do I debug this?"
* **Root Cause**: The current public IP address was not authorized in the MongoDB Atlas Whitelist, blocking the cluster connection pool.
* **Code Implementation**:
  ```diff
  // backend/backend/config/db.js
  - await mongoose.connect("mongodb://localhost/localdb");
  + const mongoUri = process.env.MONGO_URI || "mongodb+srv://<user>:<pwd>@cluster0.qe5n0ns.mongodb.net/studentmentalhealth";
  + await mongoose.connect(mongoUri);
  ```
* **Resolution**: Added IP to MongoDB Atlas Network Whitelist and restarted the process. Database connected successfully.

---

### 🔄 ERROR LOG 02: React State Syncing (Stale UI State)

* **Problem**: Saving a new mood log updated MongoDB successfully, but the history graphs and calendar heatmaps did not update until the user manually reloaded the page.
* **Developer Prompt**:
  > "When a user logs a mood, the MERN API returns 200 success, but the history React component does not re-render. How do I refresh the UI instantly without forcing a page reload?"
* **Root Cause**: Stale React state. The rendering component lacked trigger synchronization (missing state hooks or dependency triggers in the `useEffect` hook).
* **Code Implementation**:
  ```diff
  // frontend/frontend/src/modules/mood-journal/MoodTracker.jsx
  - const handleSave = () => { saveMood(data); }
  + const handleSave = async () => {
  +   await saveMood(data);
  +   fetchMoodHistory(); // Re-trigger fetch to synchronize local React state
  + }
  ```
* **Resolution**: Synced state triggers inside the save handler, resulting in immediate UI updates.

---

### 🧠 ERROR LOG 03: LLM Output Validation Failure (JSON Parsing Crash)

* **Problem**: The AI generator occasionally output introductory remarks or markdown brackets (e.g., \`\`\`json ... \`\`\`), causing `JSON.parse()` to crash the backend.
* **Developer Prompt**:
  > "I am requesting JSON from the Gemini API, but it sometimes prefixes response text before the JSON body. How do I enforce strict JSON structure and avoid parse crashes?"
* **Root Cause**: Non-deterministic text generation formats in the LLM.
* **Code Implementation**:
  ```javascript
  // Backend Parser Guard
  function cleanJSON(responseText) {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  }
  ```
* **Resolution**: Added client system prompts ("Return ONLY a clean JSON object without markdown or conversational explanations") and implemented regex extraction safety guards.

---

### 💾 ERROR LOG 04: Missing Body-Parser Middleware (Empty Requests)

* **Problem**: Journal entries submitted via POST requests were logging as empty objects `{}` in MongoDB, though the server returned a `200 OK` status code.
* **Developer Prompt**:
  > "My React form submits successfully, and the API returns 200, but journal fields in MongoDB are empty. How do I debug the payload validation?"
* **Root Cause**: Express did not configure json parsing middleware, leaving `req.body` parsed as undefined.
* **Code Implementation**:
  ```diff
  // backend/backend/server.js
  const app = express();
  + app.use(express.json()); // Parses incoming requests with JSON payloads
  ```
* **Resolution**: Enabled `express.json()` parser middleware prior to route declarations. Journal entries are now saved correctly.

---

### 📊 ERROR LOG 05: Oversimplified Risk Assessment Logic

* **Problem**: The risk classifier evaluated almost all students as "Medium Risk," neglecting nuances in high-stress or burnout metrics.
* **Developer Prompt**:
  > "My risk calculation model is too simple and returns Medium Risk for almost all users. How do I factor in mood patterns, stress scores, and historical indices?"
* **Root Cause**: The scoring logic evaluated single items in isolation rather than mapping combined standard scales.
* **Code Implementation**:
  * Upgraded scoring algorithm in [assessmentRoutes.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/routes/assessmentRoutes.js) to compile weighted criteria from the general screen (WHO-5 / GHQ-12) and conditionally route to clinical indicators (PHQ-9 / GAD-7 / MBI).
* **Resolution**: Scoring matches clinical standards, generating precise risk groupings.

---

### ⏱️ ERROR LOG 06: API Pipeline Hangs (Missing Timeout Controls)

* **Problem**: Sluggish external API connections (such as emailing alerts or model lookups) hung the user session indefinitely under poor network conditions.
* **Developer Prompt**:
  > "Gemini requests sometimes take too long, and the frontend loading icon spins forever. How do I implement request timeouts and retry mechanisms?"
* **Root Cause**: Absence of timeout abort limits in Axios / Fetch operations.
* **Code Implementation**:
  ```javascript
  // Axios Timeout Guard
  const apiClient = axios.create({
    baseURL: 'http://localhost:5001',
    timeout: 8000 // Abort after 8 seconds
  });
  ```
* **Resolution**: Set an Axios timeout limit (8 seconds), added a try-catch error boundary, and rendered fallback text to warn the user of server connectivity issues.

---

### 🌐 ERROR LOG 07: Cross-Origin Resource Sharing (CORS Block)

* **Problem**: The React client (`localhost:5173`) was unable to fetch API endpoints from the Express server (`localhost:5001`), throwing CORS protocol blocks.
* **Developer Prompt**:
  > "My frontend runs on port 5173 and backend on port 5001. The browser is blocking my requests due to Access-Control-Allow-Origin. How do I fix this in Express?"
* **Root Cause**: The browser blocks requests made to a different port or domain unless the server explicitly states they are permitted.
* **Code Implementation**:
  ```diff
  // backend/backend/server.js
  + const cors = require("cors");
  + app.use(cors()); // Allow all cross-origin requests in development
  ```
* **Resolution**: Configured Express to utilize the `cors` middleware, allowing communication between frontend and backend.

---

### 🚫 ERROR LOG 08: Duplicate Daily Entries (Data Pollution)

* **Problem**: Users could submit multiple mood logs on the same calendar day, causing skewed historical trend graphs.
* **Developer Prompt**:
  > "Users can submit multiple mood logs per day, which breaks my Chart.js analytics. How do I restrict submissions to one entry per user per day?"
* **Root Cause**: Lack of date boundaries checking in the save endpoint handler.
* **Code Implementation**:
  ```javascript
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await Mood.findOne({
    userId: req.user.id,
    mood_date: { $gte: startOfDay }
  });
  if (existing) return res.status(400).json({ message: "Already logged today" });
  ```
* **Resolution**: Validated date boundaries before saving new mood logs, ensuring only one entry exists per student per day.

---

### 🎨 ERROR LOG 09: Generic Recommendation Engine

* **Problem**: AI-generated coaching recommendations looked identical for every student, regardless of their logged emotions.
* **Developer Prompt**:
  > "My AI coach recommendations are identical for all users. How do I feed specific parameters like risk metrics, mood streaks, and analysis results to personalize the output?"
* **Root Cause**: The prompt sent to the LLM was generic and did not incorporate student-specific dashboard variables.
* **Code Implementation**:
  * Appended contextual dynamic data tokens (e.g., `${userRiskLevel}`, `${moodStreak}`) directly into the LLM system prompt.
* **Resolution**: Recommendations adapt dynamically to each user's unique emotional states and logs.

---

### ⚡ ERROR LOG 10: High Dashboard Latency (Serial API Calls)

* **Problem**: The dashboard page loaded slowly because it waited for multiple API requests (mood history, journals, appointments, assessments) to run sequentially.
* **Developer Prompt**:
  > "My dashboard takes several seconds to display because it loads mood history, journal logs, and appointment cards one after another. How do I optimize this?"
* **Root Cause**: Blocking execution chains where each asynchronous call waits for the previous one to finish.
* **Code Implementation**:
  ```diff
  // Synchronized parallel fetches
  - const moods = await getMoods();
  - const journals = await getJournals();
  + const [moods, journals] = await Promise.all([
  +   getMoods(),
  +   getJournals()
  + ]);
  ```
* **Resolution**: Grouped components using `Promise.all` to execute HTTP calls in parallel. This reduced average dashboard loading times significantly.
