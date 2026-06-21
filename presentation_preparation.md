# 🧠 Student Wellbeing App - Presentation Preparation & Speaker Notes

This guide provides a comprehensive slide structure, a word-for-word speaker script timed for a **3-minute demo video**, technical deep-dives into the codebase, and a Q&A survival guide.

---

## 📊 Presentation Overview & Slide Structure

For a **3-minute presentation**, you should have **5 to 6 slides** maximum. Visuals should take precedence over text; use bullet points, diagrams, and video playback on-screen.

| Slide # | Slide Title | Visual Focus | Timing | Word Count |
| :--- | :--- | :--- | :--- | :--- |
| **Slide 1** | **Title & The Campus Mental Health Gap** | Title, author details, stats on student anxiety & burnout. | **0:00 - 0:25** | ~55 words |
| **Slide 2** | **Student Dashboard & Mood Tracking** | Screen capture of dashboard, mood graphs, and calendar heatmaps. | **0:25 - 0:55** | ~65 words |
| **Slide 3** | **Proactive Screening: Adaptive EMA** | Diagram showing Phase 1 (WHO-5/GHQ-12) to Phase 2 (PHQ-9/GAD-7/MBI) logic. | **0:55 - 1:35** | ~90 words |
| **Slide 4** | **Safe Support: Anonymous Forum** | Graphic showing Peer view (anonymous) vs. Admin view (real user details). | **1:35 - 2:10** | ~80 words |
| **Slide 5** | **Collaborative Care: Counselor & Booking** | Counselor dashboard calendar, chat bubble interface, crisis hotline screen. | **2:10 - 2:45** | ~75 words |
| **Slide 6** | **Tech Stack & System Wrap-Up** | MERN stack logos, architecture flow, and closing slide. | **2:45 - 3:00** | ~35 words |

---

## ⏱️ 3-Minute Demo Video Sync Script

This is your word-for-word speaking script. It is designed for a moderate speaking rate of **130 words per minute** (totaling ~400 words) so you never run out of time.

```text
[0:00 - 0:25] SLIDE 1: TITLE & THE PROBLEM
-------------------------------------------------------------------------------------------------
Visual: Slide 1 (Title: "Empowering Student Mental Health")
Action: Start the presentation with high energy. 

SPEAKER:
"Good morning, everyone. Campus life is filled with high stress, yet standard mental health 
services are often reactive and stigmatized. Today, I'm excited to present the Student Wellbeing 
App—a complete, role-based MERN stack solution designed to bridge the gap between students, 
counselors, and administrators with proactive, data-driven support."
-------------------------------------------------------------------------------------------------

[0:25 - 0:55] SLIDE 2: STUDENT DASHBOARD & MOOD TRACKING
-------------------------------------------------------------------------------------------------
Visual: Slide 2 / Video shows student logging in, selecting their mood, writing a journal entry, 
        and viewing the colorful calendar heatmap and streak count.
Action: Speak as the video demonstrates mood logging.

SPEAKER:
"At its core, the student experience is built around self-awareness. Students can perform 
daily mood check-ins, write reflective journal entries, and track their consistency through 
streak counters. Built-in Chart.js visualizes their emotional trends over time, providing 
valuable insights and personalized daily affirmations that match their logged emotional states."
-------------------------------------------------------------------------------------------------

[0:55 - 1:35] SLIDE 3: PROACTIVE SCREENING (THE ADAPTIVE EMA)
-------------------------------------------------------------------------------------------------
Visual: Slide 3 / Video shows the daily EMA assessment. It shows the student completing 
        WHO-5 and GHQ-12, receiving a High-Risk score, and immediately being redirected to 
        Phase 2 (PHQ-9, GAD-7, and MBI burnout screening).
Action: Emphasize the clinical validity of this module.

SPEAKER:
"What sets our platform apart is its clinical proactive screening. Instead of basic questionnaires, 
we've built a dynamic, two-phase Ecological Momentary Assessment. 
Phase One utilizes WHO-Five and GHQ-Twelve to assess general wellbeing. 
If our system scores a student as high-risk, it dynamically escalates them to Phase Two, 
incorporating clinically validated PHQ-Nine, GAD-Seven, and Burnout screening. 
This immediately flags high-risk events in the database, triggering instant counselor notification."
-------------------------------------------------------------------------------------------------

[1:35 - 2:10] SLIDE 4: THE ANONYMOUS FORUM
-------------------------------------------------------------------------------------------------
Visual: Slide 4 / Video shows the community forum. A user writes a post, tries to type a bad 
        word (shows profanity error), changes it, posts it anonymously as 'Brave Fox'. Then 
        video transitions to the Admin Panel, where the admin sees the real student name.
Action: Highlight safety and moderated community features.

SPEAKER:
"To foster community without fear of judgment, we've implemented an anonymous student forum. 
To ensure a safe environment, we run all posts and comments through an active leo-profanity filter 
on the server. Furthermore, we preserve student trust by displaying randomly generated animal pseudonyms. 
However, for critical safety, administrators retain backend traceability, allowing them to identify 
and assist students expressing severe distress."
-------------------------------------------------------------------------------------------------

[2:10 - 2:45] SLIDE 5: COUNSELOR COLLABORATION & CRISIS SUPPORT
-------------------------------------------------------------------------------------------------
Visual: Slide 5 / Video shows booking a slot on the calendar. Transitions to Counselor Dashboard 
        where the counselor accepts the appointment, opens the in-app chat, sends a message, 
        and completes the session with remarks. Also shows the Student Crisis Hotline page.
Action: Talk through the coordination between user roles.

SPEAKER:
"When students need professional support, they can book slots directly based on real-time counselor 
availability. Counselors manage their calendar appointments, conduct secure, real-time in-app chats, 
and input post-session professional remarks. For immediate emergencies, our Crisis Support module 
provides direct, single-click access to hotlines and coping resources."
-------------------------------------------------------------------------------------------------

[2:45 - 3:00] SLIDE 6: TECH STACK & SYSTEM WRAP-UP
-------------------------------------------------------------------------------------------------
Visual: Slide 6 / Tech stack logos (React, Node, Express, MongoDB Atlas, JWT, bcryptjs, Framer Motion)
Action: Concluding remarks.

SPEAKER:
"Built on React eighteen, Vite, Express, and MongoDB, this app is fully secure, role-restricted, and 
highly responsive. Our goal is to transform campus mental health from a crisis response into a proactive, 
connected community. Thank you!"
-------------------------------------------------------------------------------------------------
```

---

## 🛠️ Technical Deep-Dive (For Slide Reference & Q&A)

Here is a summary of how the core modules are implemented in your codebase, giving you concrete technical details to cite.

### 1. The Dynamic Assessment Logic ([assessmentRoutes.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/routes/assessmentRoutes.js))
* **Two-Phase Architecture**:
  * **Phase 1**: Fetches questions matching category `who5` (Wellbeing Index) and `ghq12` (General Health Questionnaire).
    * *GHQ-12 Scoring*: Evaluates score dynamically (ratings $\ge 3$ add 1 point). If GHQ score $\ge 5$, the user is flagged as `HIGH` risk.
    * *WHO-5 Scoring*: Multiplies raw score sum by 4 (scales to 0–100%). If WHO score $< 50\%$, they are flagged.
  * **Phase 2**: If Phase 1 evaluates to `HIGH` risk, the frontend immediately redirects the student to complete Phase 2 questions: `phq9` (Depression), `gad7` (Anxiety), and `mbi` (Maslach Burnout Inventory).
    * If PHQ-9 score $\ge 15$ or GAD-7 $\ge 15$ or MBI Exhaustion $\ge 3.5$, they are categorized as high-risk, and `counselorNotified` is flagged.

### 2. The Anonymous Forum & Moderation System ([postRoutes.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/routes/postRoutes.js))
* **Profanity Filtering**: Integrates the `leo-profanity` npm package. All incoming post titles and comment texts are parsed using `leoProfanity.check(text)` prior to db insertion. If true, the request returns a `400 Bad Request` with an appropriate message.
* **Pseudonym Generation**: When a user creates their first post or comment, the backend checks if they have an `anonymousName` saved. If not, it executes a helper `generateAnonymousName()` (e.g., combining adjectives and animal names) and stores it on the `User` schema.
* **Traceable Security**: The `Post` model saves the actual student's Mongo ObjectId (`userId`). While the student API (`GET /api/posts`) hides this, the admin route (`GET /api/posts/admin/posts`) uses `.populate("userId", "name username email")` to let administrators view the author's real identity for safeguard reasons.

### 3. The Appointment Booking & Chat Flow ([appointmentRoutes.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/routes/appointmentRoutes.js))
* **Double-booking Prevention**: The API exposes a `GET /api/appointments/booked-slots` endpoint, which filters confirmed counselor slots on a specific date to prevent students from booking overlapping sessions.
* **Status Lifecycles**: Supports a full state machine for appointments: `Pending` $\to$ `Confirmed` / `Rejected` / `Reschedule Requested` $\to$ `Completed` / `Cancelled`.
* **Embedded Chat**: Uses a message array inside the appointment document. When a student or counselor posts a message, the endpoint verifies permissions (checks that the requesting user's ID matches either the `studentId` or `counselorId` in the appointment document) to ensure private communication.

---

## ❓ Q&A Survival Guide (Top 10 Questions and Answers)

Prepare for these questions from the presentation judges. Each answer is linked to your actual code implementation.

### Q1: Why did you choose a Two-Phase Assessment instead of one long questionnaire?
> **Answer:** "A single comprehensive assessment containing WHO-5, GHQ-12, PHQ-9, GAD-7, and MBI would be over 35 questions, leading to survey fatigue and low compliance. By using a two-phase approach in `assessmentRoutes.js`, we screen general wellbeing in less than 30 seconds. We only trigger the longer, clinically intensive screening if a student is flagged as high-risk, optimizing user engagement while ensuring clinical safety."

### Q2: How does the application guarantee student privacy while maintaining safety?
> **Answer:** "We use a hybrid anonymity model in `postRoutes.js`. To peers, the student's identity is masked behind a persistent generated pseudonym, encouraging honest expression. However, we save the real `userId` in the database. In case of extreme safety concerns (e.g., self-harm posts), an administrator can access the admin dashboard, which populates the student's true identity to initiate offline safety protocols."

### Q3: How is profanity filtered on the forum? Is it handled on the frontend or backend?
> **Answer:** "It is fully validated on the backend inside `postRoutes.js` using the `leo-profanity` library. Doing this on the server ensures that users cannot bypass the filter by tampering with frontend JavaScript or sending API requests directly through postman. Any content containing banned words is rejected with a 400 response."

### Q4: How do you prevent double-booking of counselors on the same date and slot?
> **Answer:** "In `appointmentRoutes.js`, we have a dedicated query route `booked-slots`. When a student selects a counselor and a date on the frontend calendar, the system calls this endpoint, which queries MongoDB for all confirmed appointments for that counselor and date, returning occupied slots. The frontend then dynamically disables those specific slots, ensuring double-booking is impossible."

### Q5: How do you handle role authorization to make sure students don't access admin or counselor routes?
> **Answer:** "We use role-restricted route middleware in both the backend and frontend. In the backend, we verify JSON Web Tokens and use middleware like `requireRole('counselor', 'admin')` to block unauthorized requests. In the frontend `App.jsx`, we wrap routes with a `<ProtectedRoute allowedRoles={['student']}>` component, which checks the current user's authenticated token claims and redirects unauthorized roles back to the homepage."

### Q6: What happens when a student is flagged as "High-Risk"? Who gets notified?
> **Answer:** "When a student completes Phase 2 of the assessment and scores high-risk, the backend sets the flag `counselorNotified` to `true` on the `DailyRisk` collection. This instantly reflects on the Counselor's dashboard alert center, prompting them to review the student's logs and reach out to book an appointment."

### Q7: If a student wants to reschedule an appointment, what is the approval flow?
> **Answer:** "Our workflow allows bidirectional scheduling. If a counselor needs to reschedule, they set the status to `Reschedule Requested` and suggest a new slot. The student receives this update on their status view and can accept the counselor's suggestion or request a different date. The state stays `Pending` until both parties agree, avoiding booking conflicts."

### Q8: What database did you use, and how did you model the user relationships?
> **Answer:** "We used MongoDB Atlas with Mongoose. The database is highly structured with references. For instance, the `Post` model holds a `userId` reference to the `User` collection, and the `Appointment` model maps a `studentId` and a `counselorId` to represent a three-way relationship (Student, Counselor, Admin) using mongoose populators."

### Q9: Can an anonymous post be deleted if it gets out of hand?
> **Answer:** "Yes, the forum features full admin moderation. In `postRoutes.js`, we provide the endpoints `GET /api/posts/admin/posts` and `DELETE /api/posts/admin/delete/:id`. The admin portal displays all active posts, and administrators have single-click capability to delete inappropriate posts or specific comments, maintaining a clean community environment."

### Q10: How do you track student mood history visually?
> **Answer:** "We store daily mood ratings in our `moods` database collection. On the frontend, we load this history and pass it to React Chart.js, which maps the ratings onto a continuous line graph showing trends over the week or month. We also render a calendar heatmap to represent streak consistency, helping students identify cyclical mood patterns."

---

## 🎯 Final Rehearsal & Delivery Checklist

* [ ] **Video Timing Alignment**: Play your 3-minute demo video alongside this script. If the video moves faster, cut down the descriptions. If the video is slower, pause briefly between slides.
* [ ] **Energy and Tone**: Keep your tone empathetic yet authoritative. Highlight keywords like *"clinical standard scales"*, *"role-based architecture"*, and *"automated safeguard rules"*.
* [ ] **Slide Transitions**: Ensure you click to the next slide at the indicated timestamps.
