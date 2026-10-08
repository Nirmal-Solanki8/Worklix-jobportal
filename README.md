# Worklix — Modern Full-Stack Recruitment & Job Portal Platform

![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Authentication](https://img.shields.io/badge/Auth-JWT%20%26%20Cookies-0284c7?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-EJS%20%26%20Vanilla%20CSS-0d9488?style=for-the-badge)

**Worklix** is an enterprise-grade recruitment and job search web application built with **Node.js, Express, MongoDB, and EJS**. Designed with a production-first MVC architecture, it delivers streamlined hiring workflows for **Jobseekers**, **Recruiters/Employers**, and **Administrators** with comprehensive Role-Based Access Control (RBAC), multipart file handling, search & filter pipelines, and dynamic dashboard metrics.

---

## ⚡ Quick Demo Credentials

For quick evaluation without manual registration, use the pre-configured demo credentials (or click the **1-Click Demo Access** buttons directly on the `/login` page):

| Role | Email | Password | Access & Features |
| :--- | :--- | :--- | :--- |
| **Candidate / Jobseeker** | `candidate@worklix.com` | `password123` | Browse jobs, submit applications with resume & cover letter, track status |
| **Recruiter / Employer** | `recruiter@worklix.com` | `password123` | Post & edit jobs, toggle open/close status, evaluate candidates, update status |
| **Platform Administrator** | `admin@worklix.com` | `password123` | High-level metrics, user role permissions, global job & application management |

---

## 🚀 Key Features by User Persona

### 👨‍💻 Candidate (Jobseeker) Experience
- **Smart Job Search & Multi-Param Filtering**: Search positions by title, keyword, company, location, experience level (Fresher, Junior, Mid, Senior), and job category.
- **Application Submission Pipeline**: Apply with single-click resume URLs or multipart uploads and personalized cover letters.
- **Duplicate Application Prevention**: Enforced at the MongoDB schema level via compound unique indexing (`applicant` + `job`).
- **Real-Time Application Tracking**: Track submission lifecycle stages (*Pending → Reviewed → Shortlisted → Accepted / Rejected*) with status badges and withdrawal capability.
- **Profile Management**: Maintain personal contact information, technical skills tags, and profile avatar.

### 🏢 Employer / Recruiter Workflow
- **Job Creation & Lifecycle Control**: Publish listings with detailed descriptions, structured requirements, salary bands, and application deadlines.
- **Posting Management**: Close listings to stop new submissions or reopen positions on demand.
- **Candidate Evaluation Portal**: Review applicant details, view submitted resumes, read cover letters, and review matched skills.
- **Application Pipeline Decisions**: Seamlessly advance applicant status with real-time updates.

### 🛡️ Administrator Hub
- **Executive Metrics Dashboard**: Live aggregate counts of registered users, active postings, and total submissions.
- **Global User & Role Management**: Promote or reassign user roles between Jobseeker, Employer, and Admin.
- **System-Wide Job & Application Auditing**: Inspect and oversee all listings and submissions across all organizations.

---

## 🏗️ System Architecture & Tech Stack

```
Worklix Architecture
├── Presentation Layer (EJS + Responsive Design System)
│   ├── Component-based partials (Navbar, Footer, Alerts, Head)
│   └── Modern CSS Tokens (Solid surfaces, micro-animations, mobile drawer)
├── Routing & Middleware
│   ├── Role-Based Access Control (RBAC: jobseeker, employer, admin)
│   ├── JWT Auth & HTTP-Only Cookie Parsing
│   └── Multer Multipart File Upload Stream
├── Business Logic (Controllers & Services)
│   ├── Page Controllers (SSR Navigation & Form Handlers)
│   └── REST API Controllers (/api/auth, /api/jobs, /api/application, /api/admin)
└── Persistence Layer (MongoDB & Mongoose)
    ├── User Schema (Bcrypt password hashing pre-save hooks)
    ├── Job Schema (Compound search filters & recruiter population)
    └── Application Schema (Unique compound index on applicant + job)
```

- **Runtime**: Node.js (v18+)
- **Server Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Templating Engine**: EJS (Embedded JavaScript templates)
- **Styling**: Vanilla CSS (CSS Custom Properties design system, zero bloated UI libraries)
- **Security & Cryptography**: Bcrypt.js (salt rounds = 10), JSON Web Tokens (JWT), HTTP-Only Cookies

---

## 📁 Repository Directory Structure

```plaintext
Worklix-project/
├── public/                 # Static assets
│   ├── css/                # Design tokens, theme, components, and layout stylesheets
│   ├── images/             # Visual branding & illustrations
│   └── uploads/            # Multipart uploaded assets (avatars, resumes)
├── scripts/
│   └── seed.js             # Realistic database seed script (mock users, jobs, applications)
├── src/
│   ├── config/             # Database connection setup (Mongoose)
│   ├── controllers/        # Request handling and business logic
│   ├── middleware/         # Auth verification, role guards, file upload filters
│   ├── models/             # Mongoose schemas (User, Job, Application, Company)
│   ├── routes/             # REST API routes and Server-Side Rendered page routes
│   ├── utils/              # Helper utilities (array parsing, sanitization)
│   └── views/              # EJS templates and reusable partials
├── .env.example            # Environment variables blueprint
├── .gitignore              # Ignored files (node_modules, .env, uploads)
├── package.json            # Scripts & project dependencies
└── server.js               # Application bootstrap and server initialization
```

---

## 🛠️ Local Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI

### 1. Clone the Repository
```bash
git clone https://github.com/Nirmal-Solanki8/Worklix-jobportal.git
cd Worklix-jobportal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```
Ensure the values match your local or cloud setup:
```env
DB_URI=mongodb://127.0.0.1:27017/jobportal
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

### 4. Seed the Database
Populate the database with realistic tech roles, candidate profiles, and demo accounts:
```bash
npm run seed
```

### 5. Launch the Server
```bash
npm start
```
Visit **[http://localhost:5000](http://localhost:5000)** in your browser.

---

## 🔌 API Endpoints Overview

In addition to full Server-Side Rendered pages, Worklix exposes modular REST API endpoints:

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in and receive auth token
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Retrieve current authenticated profile

### Jobs (`/api/jobs`)
- `GET /api/jobs` — Retrieve active jobs with search queries & filters
- `GET /api/jobs/:id` — Retrieve detailed single job posting
- `POST /api/jobs` — Create new job listing *(Employer/Admin)*
- `PUT /api/jobs/:id` — Modify existing job listing *(Owner/Admin)*
- `DELETE /api/jobs/:id` — Remove job listing *(Owner/Admin)*
- `PATCH /api/jobs/:id/status` — Toggle job status between `open` and `closed`

### Applications (`/api/application`)
- `POST /api/application/:jobId` — Submit job application *(Jobseeker)*
- `GET /api/application/my` — Retrieve candidate's submissions *(Jobseeker)*
- `GET /api/application/job/:jobId` — Retrieve all applicants for a listing *(Owner/Admin)*
- `PATCH /api/application/:id/status` — Advance candidate status *(Employer/Admin)*

---

## 🔒 Security & Best Practices Implemented

1. **Password Security**: Passwords are encrypted using **Bcrypt** with 10 salt rounds and excluded from database query projections by default.
2. **Access Control**: Distinct middleware layers (`protectPage`, `authorizePageRoles`) protect sensitive routes from unauthorized access or role elevation.
3. **Data Integrity**: Compound database indexing prevents candidate duplicate submissions at the database layer.
4. **Input Sanitization**: Normalized email formats and escaped regex query parameters mitigate injection risks.
5. **Session Management**: Session tokens are signed via JWT and persisted in secure HTTP-only cookies.

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
