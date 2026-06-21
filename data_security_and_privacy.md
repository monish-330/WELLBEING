# 🧠 Data Security, Encryption & Privacy Documentation

This document serves as the official technical documentation of the data structures, encryption mechanisms, and privacy models implemented in the **Student Wellbeing App**. It outlines how student trust is maintained and how sensitive data is securely stored.

---

## 🔒 1. Cryptographic Specifications

To protect data at rest and in transit, the system implements three core cryptographic standards:

### A. One-Way Salting and Hashing (Password Security)
* **Algorithm**: `bcryptjs` with 10 salt rounds.
* **Database Field**: `User.password`
* **Implementation Details**: Placed during registration. The raw password is salted with a unique random string and run through the Blowfish block cipher. This ensures that even if database administrators inspect the users database, the raw password remains unreadable and secure.

### B. High-Grade Symmetric Encryption (Journal Security)
* **Algorithm**: **AES-256-CBC** (Advanced Encryption Standard in Cipher Block Chaining mode).
* **Database Field**: `Journal.journal_encrypted` (Plaintext is stored as `ivHex:encryptedHex`).
* **Implementation Details** ([crypto.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/utils/crypto.js)):
  1. The server utilizes a private key (defined by `process.env.JOURNAL_SECRET` or static fallback `"journal-secret"`), hashed with `SHA-256` to create a 32-byte (256-bit) cipher key.
  2. For every write request, a fresh, randomized 16-byte **Initialization Vector (IV)** is generated using `crypto.randomBytes(16)`.
  3. The raw journal text is encrypted. The resulting string is saved in the database in the format `${ivHex}:${encryptedHex}`.
  4. On read requests, the string is split, the IV is retrieved, and the decipher is initialized to return the original plaintext. Even if the database is leaked, journal logs cannot be read without the server's private secret.

### C. Client-Side State Protection
* **Library**: `crypto-js` (Vite client integration).
* **Usage**: Prevents cleartext values from being exposed during state handshakes or temporarily in browser storage before database write operations.

### D. Secure Communication Protocols
* **In-Transit**: Standard SSL/TLS encryption for HTTPS routes prevents man-in-the-middle sniffing of chat logs and assessments.
* **Session Validation**: Signed JSON Web Tokens (JWT) store user credentials. Submissions are checked using a server-side role validation middleware (`requireRole` / `requireAuth`).

---

## 🗄️ 2. Database Models & Schema Specifications

The MongoDB database contains the following collection definitions:

### A. `User` Schema ([User.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/models/User.js))
Stores system credentials, roles, and profile configurations.

```javascript
{
  name: { type: String, required: true },               // Full Name
  username: { type: String, required: true, unique: true }, // Login username
  email: { type: String, required: true, unique: true },    // Contact email
  password: { type: String, required: true },           // Salted Bcrypt Hash
  role: { 
    type: String, 
    enum: ["student", "counselor", "admin"], 
    required: true 
  },
  anonymousName: { type: String, default: null },       // Persistent Forum Pseudonym
  studentId: { type: String, default: null, index: true }, // University Student Ref ID
  specialization: { type: String, default: "" },        // Counselor Specialization field
  department: { type: String, default: "" }             // Department field
}
```

### B. `Journal` Schema ([Journal.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/models/Journal.js))
Stores encrypted personal journals of students.

```javascript
{
  user_id: { type: String, required: true, index: true }, // Reference to owner User
  journal_encrypted: { type: String, required: true },    // AES-256-CBC Encrypted String (iv:data)
  journal_date: { type: Date, required: true },           // Log date
  edit_count: { type: Number, default: 0 }                // Track changes count
}
```

### C. `Mood` Schema ([Mood.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/models/Mood.js))
Tracks student moods for data visualization trends (Chart.js heatmaps).

```javascript
{
  userId: { type: String, required: true, index: true }, // Reference to student
  mood_code: { type: Number, required: true },           // Numeric code representing the mood
  intensity: { type: Number, required: true },           // Intensity scale (1-10)
  sticker_code: { type: Number, required: true },        // UI emoji sticker identifier
  mood_date: { type: Date, default: Date.now }           // Time of logging
}
```

### D. `DailyRisk` Schema ([DailyRisk.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/models/DailyRisk.js))
Determines a student's safety level based on daily screening scores.

```javascript
{
  studentId: { type: String, required: true, index: true }, // Student reference
  dayNumber: { type: Number, required: true },              // Program progression day
  assessmentDate: { type: String, required: true },         // "YYYY-MM-DD"
  ghqScore: { type: Number, default: 0 },                   // General Health Questionnaire Score
  whoPercentage: { type: Number, default: 0 },              // WHO Wellbeing percentage
  phqScore: { type: Number, default: 0 },                   // PHQ-9 (Depression screening score)
  gadScore: { type: Number, default: 0 },                   // GAD-7 (Anxiety screening score)
  mbiScores: {
    exhaustion: { type: Number, default: 0 },               // Maslach Burnout: Emotional Exhaustion
    cynicism: { type: Number, default: 0 },                 // Maslach Burnout: Cynicism
    efficacy: { type: Number, default: 0 }                  // Maslach Burnout: Professional Efficacy
  },
  dailyRiskLevel: { type: String, default: "LOW" },         // Evaluation level (LOW, MODERATE, HIGH)
  finalRiskLevel: { type: String, default: "LOW" },         // Escalation evaluation level
  assessment1Complete: { type: Boolean, default: false },   // Phase 1 Completion Flag
  assessment2Complete: { type: Boolean, default: false },   // Phase 2 Completion Flag
  counselorNotified: { type: Boolean, default: false },     // Alerts counselor dashboard if true
  hiddenFromCounselor: { type: Boolean, default: false }    // Student request to hide assessment logs
}
```

### E. `Appointment` Schema ([Appointment.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/models/Appointment.js))
Tracks bookings, reschedules, and direct counselor chats.

```javascript
{
  studentName: { type: String, required: true },            // Student display name
  email: { type: String, required: true },                  // Contact email
  phone: { type: String, required: true },                  // Contact phone
  counselorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },                                                        // Assigned Counselor's ID
  studentId: { type: String, default: null },               // Ref to Student User
  date: { type: String, required: true },                   // Appointment Date ("YYYY-MM-DD")
  slot: { type: String, required: true },                   // Booking slot (e.g. "10:00 - 11:00")
  status: { type: String, default: "Pending" },             // Confirmation flow
  counselorNotified: { type: Boolean, default: false },     // New booking alert flag
  remarks: { type: String, default: "" },                   // Post-session counselor remarks
  counselorSuggestedDate: { type: String, default: null },  // Reschedule date suggestion
  counselorSuggestedSlot: { type: String, default: null },  // Reschedule slot suggestion
  messages: [
    {
      sender: { type: String, enum: ["student", "counselor"], required: true },
      senderName: { type: String, required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]                                                         // Private Direct Message thread
}
```

### F. `Post` Schema ([Post.js](file:///c:/Users/gsmon/Downloads/student-wellbeing-app%20-%20Copy%20(2)/backend/backend/models/Post.js))
Forum posts which utilize a hybrid pseudonym structure.

```javascript
{
  title: { type: String, required: true },               // Post Content
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Author reference (admin-visible only)
  anonymousId: String,                                   // Pseudonym (e.g. "Gentle Rabbit") shown to peers
  realUserName: String,                                  // Real name (admin-visible only)
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  comments: [
    {
      text: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      anonymousId: String,
      realUserName: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}
```

---

## 🤝 3. Student Trust and Privacy Policy

To encourage students to feel safe utilizing this application, the software establishes three pillars of trust:

### Pillar I: Peer-Group Anonymity
* **The Model**: When writing posts or submitting comments on the forum, the application generates a persistent, friendly animal name (like `Calm Otter`).
* **The Screen**: Classmates and other student accounts will **never** see the real name or email of the poster. This encourages open sharing about mental health struggles without social stigma.

### Pillar II: Crisis Safeguards (Admin Override)
* **The Rule**: Absolute student anonymity is protected *unless* a student expresses severe mental health crises or suicidal ideation.
* **The Override**: The MongoDB schema saves the true `userId` inside the post and comment database tables. A verified administrator has access to the Admin Dashboard, which runs a population query `.populate("userId")` to trace the post back to its origin. This allows the university to immediately deploy support staff to aid the student.

### Pillar III: Active Moderation Engine
* **The Safeguard**: To prevent cyber-bullying, harassment, or trolling, the server enforces active, server-side scanning of all text entries via `leo-profanity`. Inappropriate posts or toxic submissions are blocked at the server level, preventing them from ever displaying to other students.
