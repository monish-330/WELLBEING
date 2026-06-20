# 🧠 Student Wellbeing App

An AI-powered mental health and wellbeing platform for campus students, counselors, and administrators.

---

## ✨ Features

### 👩‍🎓 Students
- **Daily Mood Tracking** — Log emotions and view trend graphs & calendar heatmaps
- **Journaling** — Write reflective notes and access journal history
- **Self-Care Activities** — Curated breathing, relaxation, and mental wellness exercises by mood category
- **EMA Assessment** — Daily wellbeing check-in with personalized risk-level results
- **Anonymous Forum** — Safe community space to share and support under anonymous identities
- **Counselor Booking** — Book, reschedule, and chat with campus counselors
- **Crisis Support** — Quick-access crisis hotlines and coping resources

### 🧑‍⚕️ Counselors
- **Appointment Dashboard** — Calendar view of Pending, Accepted, and Completed sessions
- **Accept / Request Reschedule** — Manage appointment statuses
- **In-App Chat** — Communicate directly with students around appointments
- **Complete Sessions** — Add counselor remarks and mark sessions as done
- **High-Risk Alerts** — See students who scored high in risk assessments

### ⚙️ Admins
- **User Management** — Create, view, and delete student / counselor / admin accounts
- **Assessment Questions** — Add, edit, and toggle EMA question bank
- **Motivational Quotes** — Manage quotes shown by risk level
- **Self-Care Content** — Manage wellness activities and categories
- **Forum Moderation** — Review and manage public forum posts

---

## 🗂️ Project Structure

```
student-wellbeing-app/
├── backend/
│   └── backend/               # Node.js + Express API
│       ├── config/
│       │   └── db.js          # MongoDB Atlas connection
│       ├── middleware/
│       │   └── auth.js        # JWT authentication middleware
│       ├── models/            # Mongoose schemas
│       │   ├── Appointment.js
│       │   ├── Category.js
│       │   ├── DailyRisk.js
│       │   ├── EMAQuestion.js
│       │   ├── Journal.js
│       │   ├── Mood.js
│       │   ├── MotivationQuote.js
│       │   ├── Post.js
│       │   ├── SavedContent.js
│       │   ├── SelfCare.js
│       │   ├── StudentAssessment.js
│       │   └── User.js
│       ├── routes/            # Express route handlers
│       │   ├── adminRoutes.js
│       │   ├── appointmentRoutes.js
│       │   ├── assessmentRoutes.js
│       │   ├── authRoutes.js
│       │   ├── categoryRoutes.js
│       │   ├── counselorRoutes.js
│       │   ├── forumRoutes.js
│       │   ├── journalRoutes.js
│       │   ├── moodRoutes.js
│       │   ├── postRoutes.js
│       │   ├── savedContentRoutes.js
│       │   └── selfCareRoutes.js
│       ├── uploads/           # User-uploaded files (gitignored)
│       ├── images/            # Static self-care images
│       ├── package.json
│       └── server.js          # App entry point
│
└── frontend/
    └── frontend/              # React + Vite SPA
        ├── public/
        ├── src/
        │   ├── contexts/
        │   │   └── AuthContext.jsx     # Global auth state (JWT)
        │   ├── modules/
        │   │   ├── appointments/       # Booking, status, counselor dashboard
        │   │   ├── forum/              # Posts, comments, likes
        │   │   ├── mood-journal/       # Tracker, history, calendar, graph
        │   │   ├── mood-journal-api/   # Axios instance for mood/journal APIs
        │   │   ├── selfcare/           # Category grid, cards, admin panel
        │   │   └── student-core/       # Admin panel, counselor view, quiz
        │   ├── pages/
        │   │   ├── AdminPage.jsx
        │   │   ├── AppointmentPage.jsx
        │   │   ├── AssessmentPage.jsx
        │   │   ├── CounselorPage.jsx
        │   │   ├── CrisisPage.jsx
        │   │   ├── DashboardPage.jsx
        │   │   ├── ForumPage.jsx
        │   │   ├── JournalPage.jsx
        │   │   ├── LoginPage.jsx
        │   │   ├── MoodPage.jsx
        │   │   └── SelfCarePage.jsx
        │   ├── utils/
        │   │   └── api.js              # Fetch wrapper with auth token
        │   ├── App.jsx                 # Route definitions
        │   ├── main.jsx
        │   └── styles.css
        ├── index.html
        ├── package.json
        └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or later
- **npm** v9 or later
- A **MongoDB Atlas** account (free tier is sufficient)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/student-wellbeing-app.git
cd student-wellbeing-app
```

---

### 2. Configure the Backend

```bash
cd backend/backend
```

Open `config/db.js` and replace the MongoDB URI with your own Atlas connection string:

```js
const mongoUri = "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/studentmentalhealth?retryWrites=true&w=majority";
```

> **Tip**: Use a `.env` file to keep credentials out of source control:
> ```env
> MONGO_URI=mongodb+srv://...
> JWT_SECRET=your_super_secret_key
> PORT=5001
> ```
> Then update `config/db.js` to read `process.env.MONGO_URI`.

Install dependencies and start the server:

```bash
npm install
npm run dev
```

The backend will start on **http://localhost:5001** (also binds 5000 and 3000 as fallbacks).

On first boot it automatically:
- ✅ Seeds a default **admin** account (`admin` / `admin123`)
- ✅ Seeds all self-care categories and activities
- ✅ Drops any legacy indexes

---

### 3. Configure the Frontend

```bash
cd ../../frontend/frontend
npm install
npm run dev
```

The Vite dev server starts at **http://localhost:5173**.

> All API calls target `http://localhost:5001`. If you change the backend port, update `src/utils/api.js`, `src/modules/mood-journal-api/apiInstance.js`, and any `API_BASE_URL` constants in the modules.

---

## 🔑 Default Login Credentials

| Role       | Username     | Password      |
|------------|--------------|---------------|
| Admin      | `admin`      | `admin123`    |
| Student    | Create via Admin → Users tab |
| Counselor  | Create via Admin → Users tab |

> **Security Note**: Change the admin password after first login in a production deployment.

---

## 🔗 Key API Endpoints

| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| POST   | `/api/auth/login`                | Login, returns JWT token       |
| GET    | `/api/auth/me`                   | Get logged-in user profile     |
| GET    | `/api/admin/users`               | List all users (admin only)    |
| POST   | `/api/admin/users`               | Create a new user (admin only) |
| GET    | `/api/appointments/mine`         | Student's own appointments     |
| GET    | `/api/appointments/counselor/:id`| Counselor's appointment list   |
| PUT    | `/api/appointments/accept/:id`   | Counselor accepts booking      |
| PUT    | `/api/appointments/complete/:id` | Mark session as completed      |
| GET    | `/api/selfcare`                  | List all self-care items       |
| GET    | `/api/moods`                     | Student mood history           |
| GET    | `/api/journals`                  | Student journal entries        |
| GET    | `/api/posts`                     | Forum posts                    |
| GET    | `/api/health`                    | Health check                   |

---

## 🛠️ Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React 18, Vite, React Router v6       |
| Styling    | Vanilla CSS (custom design system)    |
| Charts     | Chart.js, react-chartjs-2             |
| Animations | Framer Motion                         |
| Backend    | Node.js, Express.js                   |
| Database   | MongoDB Atlas (Mongoose ODM)          |
| Auth       | JWT (jsonwebtoken) + bcryptjs         |
| File upload| Multer                                |

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
