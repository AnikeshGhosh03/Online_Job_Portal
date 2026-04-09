# InsiderJob — Full Stack Job Portal

A full-stack job portal web application where users can browse and apply for jobs, upload resumes, and recruiters can post jobs, manage listings, and review applicants.

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS
- Clerk (user authentication)
- Axios
- React Router DOM
- React Toastify
- Quill (rich text editor)

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- Clerk Express (JWT auth middleware)
- Cloudinary (resume/image storage)
- Multer (file uploads)
- bcrypt + JWT (recruiter auth)
- Sentry (error monitoring)

---

## Features

### Job Seekers
- Sign in via Clerk (Google, email, etc.)
- Browse and search jobs by title, location, category
- Apply for jobs with one click
- Upload and manage PDF resume
- Track application status (Pending / Accepted / Rejected)

### Recruiters
- Register and log in as a company
- Post new job listings with rich text description
- Manage posted jobs and toggle visibility
- View all applicants with resume download
- Accept or reject applications

---

## Project Structure

```
├── Client/               # React frontend (Vite)
│   ├── src/
│   │   ├── assets/
│   │   ├── components/   # Navbar, Hero, JobCards, JobListing, Footer, etc.
│   │   ├── context/      # AppContext (global state)
│   │   └── pages/        # Home, ApplyJob, Applications, Dashboard, etc.
│   └── .env
│
└── server/               # Express backend
    ├── config/           # DB, Cloudinary, Multer, Sentry
    ├── controllers/      # companyController, userController, jobControllers, webhooks
    ├── middleware/        # authMiddleware (Clerk + JWT)
    ├── models/           # User, Company, Job, JobApplication
    ├── routes/           # userRoutes, companyRoutes, jobRoutes
    ├── utills/           # generateToken
    └── server.js
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account
- Clerk account
- Cloudinary account

---

### 1. Clone the repository

```bash
git clone https://github.com/AnikeshGhosh03/Online_Job_Portal.git
cd Job_Portal
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
```

Start the server:

```bash
npm run server
```

---

### 3. Frontend Setup

```bash
cd Client
npm install
```

Create a `.env` file in the `Client/` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Start the dev server:

```bash
npm run dev
```

---

## Environment Variables Summary

| Variable | Location | Description |
|---|---|---|
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret for company JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | server | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | server | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | server | Cloudinary API secret |
| `CLERK_SECRET_KEY` | server | Clerk backend secret key |
| `CLERK_PUBLISHABLE_KEY` | server | Clerk publishable key |
| `CLERK_WEBHOOK_SECRET` | server | Clerk webhook signing secret |
| `VITE_BACKEND_URL` | client | Backend API base URL |
| `VITE_CLERK_PUBLISHABLE_KEY` | client | Clerk publishable key for frontend |

---

## API Routes

### User Routes `/api/user`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/user` | Get current user data |
| POST | `/create` | Create user in DB after Clerk signup |
| POST | `/apply` | Apply for a job |
| GET | `/applications` | Get user's job applications |
| POST | `/update-resume` | Upload/update resume (PDF) |

### Company Routes `/api/company`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new company |
| POST | `/login` | Company login |
| GET | `/company` | Get company data |
| POST | `/post-job` | Post a new job |
| GET | `/list-jobs` | Get all jobs by company |
| GET | `/applicants` | Get all applicants |
| POST | `/change-status` | Accept or reject an application |
| POST | `/change-visibility` | Toggle job visibility |

### Job Routes `/api/jobs`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all visible jobs |
| GET | `/:id` | Get single job by ID |

---

## Deployment

The backend includes a `vercel.json` for Vercel deployment. Make sure all environment variables are configured in your Vercel project settings.

---

## Author

Developed by **Anikesh Ghosh**

---

## License

This project is open source and available under the [MIT License](LICENSE).
