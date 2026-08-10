Store Rating Platform

A full-stack web app where users rate stores (1–5). Built for a FullStack Intern Coding Challenge. Three roles — System Administrator, Normal User, and Store Owner — each with their own dashboard and permissions, behind a single login system.

Tech Stack
Layer	Technology
Backend	Node.js, Express
Database	MongoDB (Mongoose)
Frontend	React (Vite), React Router
Auth	JWT, bcrypt password hashing
Features
Single login for all roles; JWT-based auth with role-gated routes
Admin: dashboard stats, create users/stores/admins, filterable & sortable listings, user detail view
Normal User: sign up, browse/search stores, submit or update a 1–5 rating, change password
Store Owner: dashboard with average rating and list of users who rated their store
Server- and client-side validation (name, email, address, password, rating)
Getting Started
Prerequisites
Node.js 18+
A MongoDB instance — either MongoDB Atlas (cloud, free tier) or a local install
Clone
bash
git clone <your-repo-url>
cd fullstack-challenge
1. Backend setup
bash
cd backend
cp .env.example .env

Edit .env:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/store_rating_db   # or your Atlas connection string
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d

Install and run:

bash
npm install
npm run dev

You should see:

MongoDB connected
Server running on port 5000

Seed the first admin account (one-time):

bash
node scripts/seedAdmin.js

Default credentials (override via SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env): admin@example.com / Admin@1234

2. Frontend setup

Open a second terminal:

bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev

Visit http://localhost:5173.

Project Structure
fullstack-challenge/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/                # User, Store, Rating (Mongoose schemas)
│   ├── middleware/auth.js     # JWT verification + role guard
│   ├── routes/                # auth, admin, user, storeOwner
│   ├── utils/validators.js    # Shared field validation
│   ├── scripts/seedAdmin.js   # Bootstraps the first admin account
│   └── server.js              # Express entry point
├── frontend/
│   └── src/
│       ├── api/axios.js           # Axios instance, JWT auto-attached
│       ├── context/AuthContext.jsx
│       ├── components/            # Navbar, ProtectedRoute, SortableHeader, StarRating
│       ├── pages/                 # Login, Signup, UpdatePassword, admin/*, user/*, storeOwner/*
│       ├── App.jsx, main.jsx, styles.css
└── README.md
API Reference

Auth — /api/auth

Method	Endpoint	Access	Description
POST	/register	Public	Normal user signup
POST	/login	Public	Login for any role
PUT	/update-password	Authenticated	Change own password
GET	/me	Authenticated	Current user profile

Admin — /api/admin (role: admin)

Method	Endpoint	Description
GET	/dashboard	Totals: users, stores, ratings
POST	/users	Create a user of any role
GET	/users	List, filter (name,email,address,role), sort
GET	/users/:id	User detail (+ rating if store owner)
POST	/stores	Create a store, optional ownerId
GET	/stores	List, filter, sort, with average rating

Normal User — /api/user (role: user)

Method	Endpoint	Description
GET	/stores	Stores + overall rating + own rating
POST	/stores/:id/rating	Submit or update a rating (upsert)

Store Owner — /api/store-owner (role: store_owner)

Method	Endpoint	Description
GET	/dashboard	Average rating + list of users who rated it
Validation Rules
Name: 20–60 characters
Address: max 400 characters
Password: 8–16 characters, ≥1 uppercase letter, ≥1 special character
Email: standard format
Rating: integer, 1–5
Data Model
User: name, email, password (hashed), address, role (admin|user|store_owner), store (ref)
Store: name, email, address, owner (ref User, optional)
Rating: store (ref), user (ref), value (1–5) — unique compound index on (store, user), so resubmitting updates the existing rating rather than creating a duplicate

Average ratings are computed on read via MongoDB aggregation, so they're always accurate without redundant stored counters.

Troubleshooting
ERR_CONNECTION_RESET on the frontend: the backend isn't running or crashed before app.listen() — check its terminal output.
bad auth : Authentication failed: your MONGO_URI credentials are wrong. If using Atlas, reset the database user's password under Database Access and make sure any special characters are URL-encoded.
CORS or 404 errors: confirm the frontend's VITE_API_URL includes /api and matches the backend's port.
