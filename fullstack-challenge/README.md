# Store Rating Platform

A full-stack web app where Normal Users rate registered Stores (1-5), with three roles:
**System Administrator**, **Normal User**, and **Store Owner**.

## Tech Stack
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Frontend:** React (Vite) + React Router
- **Auth:** JWT, single login endpoint, role-based access control

## Project Structure
```
fullstack-challenge/
  backend/
    config/db.js            MongoDB connection
    models/                 User, Store, Rating (Mongoose schemas)
    middleware/auth.js       JWT verification + role guard
    routes/                 auth, admin, user, storeOwner
    utils/validators.js      Shared field validation (name/email/address/password/rating)
    scripts/seedAdmin.js     Creates the first admin account
    server.js                Express app entry point
  frontend/
    src/
      api/axios.js            Axios instance with JWT auto-attached
      context/AuthContext.jsx Auth state, login/register/logout
      components/             Navbar, ProtectedRoute, SortableHeader, StarRating
      pages/                  Login, Signup, UpdatePassword, admin/*, user/*, storeOwner/*
      App.jsx, main.jsx, styles.css
```

## Setup

### 1. Backend
```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI to your MongoDB instance (local or Atlas), and a real JWT_SECRET
npm install
npm run dev            # starts on http://localhost:5000

# Create the first admin account (edit SEED_ADMIN_EMAIL/PASSWORD in .env if desired):
node scripts/seedAdmin.js
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env    # VITE_API_URL defaults to http://localhost:5000/api
npm install
npm run dev             # starts on http://localhost:5173
```

Log in with the seeded admin account, then use the Admin panel to create Store Owner
and Normal User accounts, and to register stores (optionally linking a store to a
Store Owner account).

## Data Model
- **User**: name, email, password (hashed), address, role (`admin` | `user` | `store_owner`), store (ref, store_owner only)
- **Store**: name, email, address, owner (ref User, optional)
- **Rating**: store (ref), user (ref), value (1-5). Unique index on `(store, user)` so a
  resubmission updates the existing rating instead of creating a duplicate.

Average ratings are computed on read via MongoDB aggregation rather than stored
redundantly, so they're always accurate.

## API Overview

**Auth** (`/api/auth`)
- `POST /register` — public signup (Normal User only)
- `POST /login` — all roles
- `PUT /update-password` — authenticated
- `GET /me` — current user

**Admin** (`/api/admin`, admin only)
- `GET /dashboard` — totals (users, stores, ratings)
- `POST /users` — create user of any role
- `GET /users?name=&email=&address=&role=&sortBy=&order=` — filterable/sortable list
- `GET /users/:id` — user detail (includes rating if store owner)
- `POST /stores` — create store, optionally with `ownerId`
- `GET /stores?name=&email=&address=&sortBy=&order=` — filterable/sortable list with ratings

**Normal User** (`/api/user`, user only)
- `GET /stores?name=&address=&sortBy=&order=` — stores with overall + own rating
- `POST /stores/:id/rating` — submit or update rating (upsert)

**Store Owner** (`/api/store-owner`, store_owner only)
- `GET /dashboard` — average rating + list of users who rated the store

## Validation Rules (enforced both client- and server-side)
- Name: 20-60 characters
- Address: max 400 characters
- Password: 8-16 characters, at least one uppercase letter and one special character
- Email: standard format
- Rating: integer 1-5

## Notes
- All list endpoints support case-insensitive partial-match filtering and
  ascending/descending sort on key fields (Name, Email, Address, Role).
- Passwords are hashed with bcrypt; JWTs are used for stateless auth (7-day expiry by default).
- The Rating collection's unique `(store, user)` index means "submit" and "modify" a
  rating are the same upsert operation, matching the requirement that users can
  update their submitted rating.
