# Gym Management System

Production gym management system for a single gym with multiple admin accounts and member logins.

## Features

- Admin and member authentication with JWT, forgot / reset / change password
- Member management: create, edit, view, delete, search, and pagination
- Payments, separate from registered members, with active and expired tabs and a payment history for each member
- Membership plans with durations, prices, and active / expired / inactive status
- Attendance check-in and check-out, including one check-in per member per day
- Dashboard statistics, attendance chart, recent registrations, and expiry list
- Announcements with optional email
- Gym timings and checkout rules
- Attendance reports with CSV, PDF, and print
- Registration, end-date expiry reminder, announcement, and password reset emails

## Technology stack

- Frontend: Vite, React, JavaScript, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JWT and bcrypt
- Email: Nodemailer over SMTP
- Hosting: Vercel for the frontend and backend, MongoDB for data

## Folder structure

```
gym-management-system/
├── frontend/          Vite + React application
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── routes/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       ├── constants/
│       ├── config/
│       └── validations/
├── backend/           Express API
│   └── src/
│       ├── config/
│       ├── constants/
│       ├── models/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       ├── utils/
│       ├── validations/
│       ├── templates/
│       ├── helpers/
│       └── scripts/
├── README.md
└── .gitignore
```

Frontend and backend stay in separate folders and are deployed separately.

## Installation

Requirements: Node.js 20+, MongoDB.

```bash
cd backend
cp .env.example .env
npm install

cd ../frontend
cp .env.example .env
npm install
```

On Windows PowerShell, copy the example env file with `Copy-Item .env.example .env`.

## Environment variables

Backend (`backend/.env`):

| Variable | Purpose |
| --- | --- |
| `PORT` | API port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing secret for access tokens |
| `JWT_EXPIRES_IN` | Token lifetime, for example `7d` |
| `FRONTEND_URL` | Allowed CORS origin |
| `APP_TIMEZONE` | IANA timezone used for attendance dates. Default `Asia/Kolkata` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Outbound email. Leave host empty to skip sending in development |
| `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | First admin created by the seed script |

Frontend (`frontend/.env`):

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend origin, for example `http://localhost:5000` |

Never commit `.env` files. The frontend only receives the public API URL.

## Development

```bash
cd backend
npm run seed
npm run dev
```

```bash
cd frontend
npm run dev
```

The API runs at `http://localhost:5000` and the app at `http://localhost:5173`.

## Build

```bash
cd frontend
npm run build
```

```bash
cd backend
npm start
```

## Deployment

- Frontend: import the `frontend` directory on Vercel. Set `VITE_API_URL` to the backend origin. `vercel.json` rewrites client routes to `index.html`.
- Backend: import the `backend` directory on Vercel. `vercel.json` serves the Express app. Set the same environment variables as local development, and set `FRONTEND_URL` to the deployed frontend origin.
- Database: MongoDB Atlas (or another hosted MongoDB). Put the connection string in `MONGODB_URI`.

## Database setup

```bash
cd backend
npm run seed
```

The seed script is idempotent. It creates gym settings, the four default plans, and the first admin when that email does not already exist.

Default plans:

| Plan | Duration | Price |
| --- | --- | --- |
| Monthly | 1 month | ₹1,000 |
| Quarterly | 3 months | ₹2,500 |
| Half-Yearly | 6 months | ₹5,000 |
| Yearly | 12 months | ₹10,000 |

Collections: `Admin`, `Member`, `MembershipPlan`, `MembershipPayment`, `Attendance`, `Announcement`, `GymSettings`.

A member's access is a sequence of paid periods. Creating a member records the first payment. Admins mark each following period as paid and can choose a different plan each time. The current plan is the period that covers today. Members see that plan and the full payment history.

## Authentication

Passwords are hashed with bcrypt. Login returns a JWT used as `Authorization: Bearer <token>`.

Roles:

- `admin` can manage members, plans, attendance, announcements, settings, reports, and other admins
- `member` can view only their own profile, membership, attendance, and announcements

Authorization is enforced on the API. The frontend redirects unauthenticated users to `/login`.

Password reset links expire after one hour. In development, when SMTP is not configured, the reset link is written to the server log and a new member's temporary password is shown once to the admin who created them.

## API overview

Success responses:

```json
{ "success": true, "message": "Member fetched successfully", "data": {} }
```

Error responses:

```json
{ "success": false, "message": "Unable to fetch member", "error": {} }
```

File exports (`CSV` and `PDF`) return the file itself. Errors from those routes still use the JSON envelope.

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |
| GET | `/api/auth/me` | Signed in |
| PATCH | `/api/auth/profile` | Admin |
| POST | `/api/auth/change-password` | Signed in |
| GET/POST | `/api/auth/admins` | Admin |
| PATCH/DELETE | `/api/auth/admins/:id` | Admin |
| GET/POST | `/api/admin/members` | Admin |
| GET/PATCH/DELETE | `/api/admin/members/:id` | Admin |
| POST | `/api/admin/members/:id/payments` | Admin |
| GET/POST/PATCH/DELETE | `/api/admin/plans` | Admin |
| POST | `/api/admin/plans/reminders` | Admin |
| GET/POST | `/api/admin/attendance` | Admin |
| POST | `/api/admin/attendance/manual` | Admin |
| PATCH/DELETE | `/api/admin/attendance/:id` | Admin |
| GET/POST/PATCH/DELETE | `/api/admin/announcements` | Admin |
| GET/PUT | `/api/admin/settings` | Admin |
| GET | `/api/admin/reports` | Admin |
| GET | `/api/admin/reports/export` | Admin |
| GET | `/api/dashboard/admin` | Admin |
| GET | `/api/dashboard/member` | Member |
| GET | `/api/member/membership` | Member |
| GET | `/api/member/attendance` | Member |
| POST | `/api/member/attendance/check-in` | Member |
| POST | `/api/member/attendance/check-out` | Member |
| GET | `/api/member/announcements` | Member |
| GET | `/api/gym` | Public |
| GET | `/api/health` | Public |

Attendance rules live in `backend/src/services/attendance.service.js`: a member can check in once per day, either themselves or through an admin, and checkout follows the `checkoutRequired` gym setting. An admin can also open a previous day and record that visit with a start and end time. Admins can correct check-in and check-out times on that same day, or delete a record so the member can check in again. Membership end dates and statuses are calculated in `backend/src/services/membership.service.js`.
