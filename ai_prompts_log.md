# 🤖 AI Prompt Log: Step-by-Step Development Journey

This log documents the exact sequence of prompts, iterations, and instructions used to co-develop the **Student Wellbeing App** using AI assistance. It is structured chronologically to illustrate professional developer-AI collaboration.

---

## 🛠️ Phase 1: Tech Stack Initialization & Setup

### Prompt 1.1: Project Initialization
> **Developer Prompt:**
> "I want to initialize a MERN stack project for a student wellbeing application. Set up a Node/Express backend in a `/backend/backend` folder and a Vite/React frontend in a `/frontend/frontend` folder. Make sure CORS is enabled, standard folder structure is created, and configure MongoDB connection inside `config/db.js` using Mongoose."

### Prompt 1.2: Base Styling System Setup
> **Developer Prompt:**
> "Create a global styling system in the frontend using standard CSS variables for colors (pastel pinks, calming purples, soft blues) and modern typography (Outfit/Inter). Setup global styles, responsive containers, and buttons with subtle hover scales."

---

## 🔑 Phase 2: Role-Based Authentication & Guarding

### Prompt 2.1: User Schema Design
> **Developer Prompt:**
> "Write the Mongoose schema for `User` in [User.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/models/User.js). It needs to support three roles: student, counselor, and admin. Add fields for name, username, email, hashed password, studentId (for students), specialization (for counselors), and department. Make sure username and email are unique."

### Prompt 2.2: JWT Auth Endpoints
> **Developer Prompt:**
> "Create auth endpoints inside [authRoutes.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/routes/authRoutes.js) for `/register` (restricted to Admin role) and `/login` (public). Use `bcryptjs` to hash and verify passwords. Sign a JSON Web Token (JWT) on successful login containing user ID, role, and studentId, with a 1-day expiration."

### Prompt 2.3: Frontend Route Guards
> **Developer Prompt:**
> "In React, create a `ProtectedRoute` component in [App.jsx](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/frontend/frontend/src/App.jsx) that decodes the JWT role claim. If a student tries to access admin routes, redirect them. If a guest tries to access dashboard routes, redirect them to the `/login` screen."

---

## 📊 Phase 3: Mood Tracking & Encrypted Journaling

### Prompt 3.1: Mood Logging and Analytics
> **Developer Prompt:**
> "Design a Mood model and tracking module. Students should log daily mood ratings (1-10 intensity) with a sticker code. On the dashboard, render their mood history on a continuous trend graph using React Chart.js, and a calendar heatmap showing their logging streak."

### Prompt 3.2: Secure Journal Hashing & AES-256-CBC
> **Developer Prompt:**
> "Create an encryption utility in the backend in [crypto.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/utils/crypto.js) using the native Node `crypto` library. Implement AES-256-CBC encryption for journal text. Generate a random 16-byte IV for every entry, and hash the server's private secret key using SHA-256 to construct a 32-byte key. Store the output in MongoDB in the format `ivHex:encryptedHex`."

---

## 🧠 Phase 4: Proactive Adaptive EMA Assessments

### Prompt 4.1: Adaptive Assessment Engine
> **Developer Prompt:**
> "Implement the daily Ecological Momentary Assessment (EMA) API in [assessmentRoutes.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/routes/assessmentRoutes.js). 
> Phase 1 must fetch WHO-5 and GHQ-12 questions. Calculate risk: if WHO-5 percentage is under 50% or GHQ-12 score is 5 or higher, categorize as HIGH risk.
> If flagged HIGH risk in Phase 1, the frontend must immediately prompt them to take Phase 2 questions (PHQ-9, GAD-7, and MBI Burnout screening)."

### Prompt 4.2: Automated Counselor Alarm Routing
> **Developer Prompt:**
> "Modify the submission code so that if a student completes Phase 2 and evaluates to high-risk (PHQ-9 >= 15, GAD-7 >= 15, or MBI Exhaustion >= 3.5), set `counselorNotified` to true in MongoDB and trigger an immediate high-risk warning alert on the Counselor's dashboard."

---

## 💬 Phase 5: Anonymous Community Forum & Server Moderation

### Prompt 5.1: Pseudonym assignment
> **Developer Prompt:**
> "Design a community forum in [postRoutes.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/routes/postRoutes.js). The first time a student writes a post or comment, generate a random persistent pseudonym (e.g. animal names like 'Brave Fox') and store it in their User document. Peers must only see this animal pseudonym."

### Prompt 5.2: Server-Side Profanity Scanning
> **Developer Prompt:**
> "To prevent bullying on the anonymous forum, integrate `leo-profanity` in the backend. Before saving any post title or comment text to MongoDB, check it against the dictionary. If flagged, return a 400 Bad Request warning the user about inappropriate language."

### Prompt 5.3: Admin Back-Trace Escapes
> **Developer Prompt:**
> "Write an administrator route that fetches all active posts and utilizes `.populate('userId')` to reveal the true author name and email. This is an override safeguard so admins can deploy safety support if a student posts a suicide or crisis warning."

---

## 📅 Phase 6: Counselor Scheduling & Interactive Chat

### Prompt 6.1: Real-Time Calendar Double-Booking Check
> **Developer Prompt:**
> "Design the appointment booking API in [appointmentRoutes.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/routes/appointmentRoutes.js). Create an endpoint `/booked-slots` that returns all confirmed slots for a selected counselor and date. The frontend calendar must parse this data and dynamically disable those times, making double-booking impossible."

### Prompt 6.2: Status State-Machine & Chat
> **Developer Prompt:**
> "Allow counselors to update status: Accept (sets to Confirmed), Reject, or Reschedule. For reschedules, suggest a new slot. Additionally, embed a message array directly in the appointment document. When a message is sent, verify that the request user ID belongs to either the student or counselor assigned to that appointment."

---

## 🏥 Phase 7: Crisis support & Final Seeding

### Prompt 7.1: Single-click Crisis Support
> **Developer Prompt:**
> "Build a Crisis Support page in the React frontend. Include local campus helpline links, ambulance routing details, and national distress lines, styled in high-visibility warning banners with a single-click emergency call feature."

### Prompt 7.2: Default System Seeding
> **Developer Prompt:**
> "Write the database seeding function inside [server.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/server.js) that runs on startup. Seed default accounts for all roles: an Admin (`admin`/`admin123`), a Student (`student`/`student123`), and a Counselor (`counselor`/`counselor123`). This allows examiners to test the system instantly."

---

## 📊 Appendix: Clinical EMA Scales & Assessment Question Banks

The following clinical assessment metrics are embedded into the Ecological Momentary Assessment database structures to gauge student wellbeing:

### 🧠 A. EMA Overview
**Ecological Momentary Assessment (EMA)** is a method of collecting a person's feelings, emotions, behaviors, or mental health status in real time or at regular intervals during daily life, instead of asking them to remember how they felt in the past.

### 📋 B. Assessment Scales & Question Banks

#### 🩺 WHO-5 (5 Questions) — Wellbeing Index
1. My daily life has been filled with things that interest me.
2. I woke up feeling fresh and rested.
3. I have felt active and vigorous.
4. I have felt calm and relaxed.
5. I have felt cheerful and in good spirits.

#### 🩺 GHQ-12 (12 Questions) — General Health Questionnaire
1. Have you recently found it difficult to relax?
2. Have you recently felt pressure from academic work?
3. Have you recently felt unable to enjoy daily activities?
4. Have you recently felt emotionally exhausted?
5. Have you recently felt overwhelmed by responsibilities?
6. Have you recently felt nervous or anxious?
7. Have you recently found it difficult to concentrate?
8. Have you recently been feeling stressed?
9. Have you recently felt unhappy or depressed?
10. Have you recently felt unable to overcome difficulties?
11. Have you recently lost sleep because of worry?
12. Have you recently felt constantly under strain?

#### 🩺 GAD-7 (7 Questions) — Generalized Anxiety Disorder scale
1. Feeling nervous, anxious, or on edge.
2. Not being able to stop or control worrying.
3. Worrying too much about different things.
4. Trouble relaxing.
5. Being so restless that it is hard to sit still.
6. Becoming easily annoyed or irritable.
7. Feeling afraid as if something awful might happen.

#### 🩺 PHQ-9 (9 Questions) — Patient Health Questionnaire for Depression
1. Little interest or pleasure in doing things.
2. Feeling down, depressed, or hopeless.
3. Trouble falling or staying asleep, or sleeping too much.
4. Feeling tired or having little energy.
5. Poor appetite or overeating.
6. Feeling bad about yourself — or that you are a failure or have let yourself or your family down.
7. Trouble concentrating on things, such as reading the newspaper or watching television.
8. Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual.
9. Thoughts that you would be better off dead or of hurting yourself in some way.

#### 🩺 MBI (16 Questions) — Maslach Burnout Inventory (Student Version)
1. I feel tired when I think about studying.
2. I feel exhausted at the end of the day.
3. I feel burned out from academic work.
4. I feel frustrated by my workload.
5. I feel overwhelmed by my responsibilities.
6. I feel detached from my studies.
7. I feel less enthusiastic about learning.
8. I have become less interested in academic activities.
9. I doubt the value of my studies.
10. I feel less productive than before.
11. I have difficulty concentrating on tasks.
12. I struggle to complete assignments.
13. I feel ineffective in my academic performance.
14. I feel unable to achieve my goals.
15. I feel emotionally drained by my studies.
16. I feel emotionally drained by my studies. (Double-check validation redundancy)

