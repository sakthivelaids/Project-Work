# ⚡ TrackLearns — Full-Stack Course Learning Platform

A complete full-stack course learning platform built with **React**, **Node.js/Express**, and **PostgreSQL**.

---

## 🗂️ Project Structure

```
tracklearns/
├── client/                  ← React Frontend (Vite)
│   ├── src/
│   │   ├── components/      ← Navbar, CourseCard, UI components
│   │   ├── context/         ← Auth, Toast, Theme context
│   │   ├── pages/           ← Home, Courses, Dashboard, etc.
│   │   ├── services/        ← Axios API service
│   │   ├── styles/          ← Global CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                  ← Node.js Backend (Express)
    ├── config/              ← Database connection
    ├── controllers/         ← Route logic
    ├── database/            ← Table migrations
    ├── middleware/          ← Auth, error handlers
    ├── models/
    ├── routes/              ← API routes
    ├── server.js
    └── package.json
```

---

## ✅ Step-by-Step Local Setup Guide

### Step 1 — Install Required Software

#### 1a. Install Node.js
- Visit: https://nodejs.org
- Download and install the **LTS version** (v18 or v20 recommended)
- Verify installation:
  ```bash
  node -v
  npm -v
  ```

#### 1b. Install PostgreSQL
- Visit: https://www.postgresql.org/download/
- Download and install PostgreSQL for your OS
- During installation, set a **password for the `postgres` user** — you'll need this
- Verify installation:
  ```bash
  psql --version
  ```

---

### Step 2 — Get the Project Files

If you downloaded the zip, extract it. You should have a `tracklearns` folder with `client` and `server` inside.

```
tracklearns/
├── client/
└── server/
```

---

### Step 3 — Create the PostgreSQL Database

Open your terminal and connect to PostgreSQL:

**Windows (Command Prompt or PowerShell):**
```bash
psql -U postgres
```

**Mac/Linux (Terminal):**
```bash
psql -U postgres
```

Once inside the PostgreSQL shell, run:
```sql
CREATE DATABASE tracklearns;
\q
```

---

### Step 4 — Configure the Backend

#### 4a. Open a terminal and navigate to the server folder:
```bash
cd tracklearns/server
```

#### 4b. Install backend dependencies:
```bash
npm install
```

#### 4c. Create the `.env` file:
Copy the example file and fill in your values:
```bash
cp .env.example .env
```

Open `.env` in any text editor and update it:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=tracklearns
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

JWT_SECRET=any_long_random_string_here_make_it_secure
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

> ⚠️ Replace `your_postgres_password_here` with the password you set during PostgreSQL installation.

#### 4d. Start the backend server:
```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
✅ All tables created successfully
🚀 TrackLearns Server running on http://localhost:5000
```

> The server automatically creates all database tables on first run!

---

### Step 5 — Configure the Frontend

Open a **new terminal window** (keep the backend running).

#### 5a. Navigate to the client folder:
```bash
cd tracklearns/client
```

#### 5b. Install frontend dependencies:
```bash
npm install
```

#### 5c. Start the frontend:
```bash
npm run dev
```

You should see:
```
  VITE v5.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

---

### Step 6 — Open in Browser

Open your browser and go to:
```
http://localhost:5173
```

🎉 **TrackLearns is now running!**

---

## 🚀 Quick Start Summary

| Terminal | Command | What it does |
|----------|---------|-------------|
| Terminal 1 | `cd server && npm run dev` | Starts API on port 5000 |
| Terminal 2 | `cd client && npm run dev` | Starts UI on port 5173 |

---

## 🧪 Testing the Platform

### Create an Instructor Account
1. Go to http://localhost:5173/register
2. Select **Instructor** role
3. Fill in your details and register
4. You'll be redirected to the Instructor Dashboard

### Create a Student Account
1. Open an incognito/private browser window
2. Go to http://localhost:5173/register
3. Select **Student** role
4. Register and browse courses

### Workflow
1. **Instructor**: Create a course from the dashboard
2. **Student**: Browse and enroll in the course
3. **Student**: Track progress from the dashboard
4. **Student**: Leave a review after enrolling

---

## 🔌 API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses (with search/filter) |
| GET | `/api/courses/:id` | Get course details |
| POST | `/api/courses` | Create course (instructor) |
| PUT | `/api/courses/:id` | Update course (instructor) |
| DELETE | `/api/courses/:id` | Delete course (instructor) |
| GET | `/api/courses/instructor/my-courses` | Get instructor's courses |
| GET | `/api/courses/categories` | Get all categories |

### Enrollment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/enroll` | Enroll in a course |
| GET | `/api/enroll` | Get enrolled courses |
| PUT | `/api/enroll/progress` | Update course progress |
| GET | `/api/enroll/students/:course_id` | Get enrolled students |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| PUT | `/api/user/change-password` | Change password |
| GET | `/api/user/dashboard-stats` | Get dashboard statistics |

### Lessons & Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lessons/course/:id` | Get lessons for a course |
| POST | `/api/lessons` | Add lesson (instructor) |
| DELETE | `/api/lessons/:id` | Delete lesson |
| POST | `/api/reviews` | Submit a review |
| GET | `/api/reviews/course/:id` | Get course reviews |

---

## 🛠️ Troubleshooting

### ❌ "Cannot connect to database"
- Make sure PostgreSQL is running
- Check your `.env` DB_PASSWORD is correct
- Verify the `tracklearns` database exists: `psql -U postgres -c "\l"`

### ❌ "npm not found" or "node not found"
- Reinstall Node.js from https://nodejs.org
- Restart your terminal after installation

### ❌ Port 5000 or 5173 already in use
- Change the port in `.env` (PORT=5001) and update `CLIENT_URL`
- Or kill the process using the port

### ❌ CORS error in browser
- Make sure `CLIENT_URL` in `.env` matches exactly where your frontend runs
- Default: `http://localhost:5173`

### ❌ "Module not found" errors
- Run `npm install` again in both `client` and `server` folders

---

## 🌟 Features

### Student Features
- ✅ Register and login
- ✅ Browse and search courses
- ✅ Filter by category and level
- ✅ Enroll in courses
- ✅ Track learning progress
- ✅ Leave course reviews with star ratings
- ✅ Personal dashboard with stats

### Instructor Features
- ✅ Create and manage courses
- ✅ Add lessons with video URLs
- ✅ View enrolled students
- ✅ Course analytics (enrollment count, ratings)
- ✅ Delete courses

### Platform Features
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Dark/Light theme toggle
- ✅ Fully responsive design
- ✅ Toast notifications
- ✅ Search and filter courses
- ✅ Pagination
- ✅ Modal dialogs
- ✅ Progress tracking
