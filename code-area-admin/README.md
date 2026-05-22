# CodeArea Admin Portal

Full-stack admin panel for the CodeArea competitive programming platform.

## Project Structure

```
codearea-admin/
├── Backend/          ← Express + MongoDB API
│   ├── models/
│   │   ├── AdminUser.js
│   │   ├── Contest.js
│   │   ├── Problem.js
│   │   ├── Submission.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── contests.js
│   │   └── problems.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── src/              ← React frontend
    ├── Components/
    │   ├── Auth/
    │   │   ├── Login.js
    │   │   └── Register.js
    │   ├── Admin/
    │   │   └── Dashboard.js
    │   ├── Contest/
    │   │   ├── Contests.js
    │   │   ├── ManageContest.js
    │   │   ├── AddChallenge.js
    │   │   ├── Announcements.js
    │   │   ├── ViewSubmissions.js
    │   │   ├── RegisteredCandidates.js
    │   │   └── PlagDetection.js
    │   ├── Problem/
    │   │   └── Problems.js
    │   └── Common/
    │       ├── Layout.js
    │       ├── Sidebar.js
    │       └── HorizontalLoader.js
    ├── App.js
    ├── AuthContext.js
    ├── api.js
    ├── index.js
    └── index.css
```

## Setup

### Backend
```bash
cd Backend
npm i
node server.js
```

### Frontend
```bash
# in codearea-admin root
npm i
npm start
```

## Features
- **AdminUser Auth** — JWT login/register for AdminUser accounts
- **Dashboard** — Contest history, live stats
- **Contests** — Create, edit, delete contests
- **Manage Contest** (5 tabs):
  - 📋 **Challenges** — Add/edit problems with tabbed form (Problem Detail / Sample Test Cases / Hidden Test Cases + Save)
  - 📢 **Announcements** — Send to registered candidates only
  - 📊 **View Submissions** — Charts, filters, code viewer
  - 👥 **Registered Candidates** — Leaderboard + per-candidate analytics
  - 🔍 **Plag Detection** — Per-problem (logic stub, wire in your engine)
- **Problems** — Standalone problem bank with tabbed editor

## Schema
- `AdminUser` — username, email, password (hashed), isAdmin
- `Contest` — title, description, startTime, endTime, problems[], registeredCandidates[], announcements[]
- `Problem` — title, description, difficulty, testcases, sampleTestCases, checker, etc.
- `Submission` — userId, problemId, contestId, code, language, verdict
- `User` — username, email, password (registered contestants)
