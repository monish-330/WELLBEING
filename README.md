# 🧠 Student Wellbeing App

An AI-powered mental health and wellbeing platform for campus students, counselors, and administrators.

---

## ✨ Features

### 👩‍🎓 Students

* Daily Mood Tracking — Log emotions and view trend graphs & calendar heatmaps
* Journaling — Write reflective notes and access journal history
* Self-Care Activities — Curated breathing, relaxation, and mental wellness exercises by mood category
* EMA Assessment — Daily wellbeing check-in with personalized risk-level results
* Anonymous Forum — Safe community space to share and support under anonymous identities
* Counselor Booking — Book, reschedule, and chat with campus counselors
* Crisis Support — Quick-access crisis hotlines and coping resources

### 🧑‍⚕️ Counselors

* Appointment Dashboard — Calendar view of Pending, Accepted, and Completed sessions
* Accept / Request Reschedule — Manage appointment statuses
* In-App Chat — Communicate directly with students around appointments
* Complete Sessions — Add counselor remarks and mark sessions as done
* High-Risk Alerts — See students who scored high in risk assessments

### ⚙️ Admins

* User Management — Create, view, and delete student, counselor, and admin accounts
* Assessment Questions — Add, edit, and manage EMA question banks
* Motivational Quotes — Manage quotes shown by risk level
* Self-Care Content — Manage wellness activities and categories
* Forum Moderation — Review and manage community posts

---

## 🗂️ Project Structure

```text
student-wellbeing-app/
├── backend/
│   └── backend/
│       ├── config/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── uploads/
│       ├── images/
│       ├── package.json
│       └── server.js
│
└── frontend/
    └── frontend/
        ├── src/
        ├── public/
        ├── package.json
        ├── vite.config.js
        └── index.html
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js v18 or later
* npm v9 or later
* MongoDB Atlas Account

### Clone the Repository

```bash
git clone https://github.com/monish-330/WELLBEING.git
cd WELLBEING
```

---

## Backend Setup

```bash
cd backend/backend
npm install
npm run dev
```

Configure MongoDB Atlas connection inside:

```text
backend/backend/config/db.js
```

Example:

```js
const mongoUri = "mongodb+srv://username:password@cluster.mongodb.net/studentmentalhealth";
```

---

## Frontend Setup

```bash
cd frontend/frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Backend URL:

```text
http://localhost:5001
```

---

## 🔑 Default Admin Login

| Username | Password |
| -------- | -------- |
| admin    | admin123 |

> Change the default password before production deployment.

---

## 🔗 Main API Endpoints

| Method | Endpoint               |
| ------ | ---------------------- |
| POST   | /api/auth/login        |
| GET    | /api/auth/me           |
| GET    | /api/admin/users       |
| POST   | /api/admin/users       |
| GET    | /api/appointments/mine |
| GET    | /api/selfcare          |
| GET    | /api/moods             |
| GET    | /api/journals          |
| GET    | /api/posts             |

---

## 🛠️ Tech Stack

### Frontend

* React 18
* Vite
* React Router
* Chart.js

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* JWT
* bcryptjs

### Other Tools

* Multer
* Framer Motion

---

## 🎯 Key Modules

* Student Dashboard
* Mood Tracking
* Journal Management
* Self-Care Activities
* EMA Assessments
* Anonymous Forum
* Counselor Appointment Booking
* Crisis Support
* Admin Management Portal

---

## 📸 Screenshots

Add screenshots of your application here.

---

## 👨‍💻 Author

**Monish G**

GitHub: https://github.com/monish-330

---

## 📄 License

This project is licensed under the MIT License.
