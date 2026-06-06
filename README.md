# ⚽ Football App

A full-stack web application built with **Flask** (backend) and **React + Vite** (frontend).  
Users can register, log in, and read posts. Admins can also create posts.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | Python 3.12, Flask 3, Flask-JWT-Extended, Gunicorn |
| Frontend  | React 18, React Router 6, Axios, Tailwind CSS, Vite |
| Auth      | JWT (HS256), bcrypt password hashing (Werkzeug) |
| Deploy    | Railway (Docker)                                |

---

## Project Structure

```
football/
├── backend/
│   ├── app.py              # Flask application & API routes
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Router + route guards
│   │   ├── main.jsx        # React entry point
│   │   ├── index.css       # Tailwind CSS
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Posts.jsx
│   │   │   └── CreatePost.jsx
│   │   └── services/
│   │       └── api.js      # Axios client with JWT interceptors
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── Dockerfile              # Multi-stage build (frontend → backend)
├── .env.example            # Backend env vars template
└── README.md
```

---

## API Reference

| Method | Endpoint        | Auth         | Description              |
|--------|-----------------|--------------|--------------------------|
| GET    | `/api/health`   | None         | Health check             |
| POST   | `/api/register` | None         | Register a new user      |
| POST   | `/api/login`    | None         | Login, returns JWT token |
| GET    | `/api/posts`    | JWT required | Fetch all posts          |
| POST   | `/api/posts`    | Admin JWT    | Create a new post        |

### Register — `POST /api/register`
```json
{ "username": "alice", "password": "secret123", "role": "user" }
```
Roles: `"user"` (read-only) or `"admin"` (can create posts).

### Login — `POST /api/login`
```json
{ "username": "alice", "password": "secret123" }
```
Returns:
```json
{ "access_token": "<jwt>", "username": "alice", "role": "user" }
```

### Create Post — `POST /api/posts` *(admin only)*
```json
{ "title": "Match Preview", "content": "Tonight's big game…" }
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy and edit environment variables
cp ../.env.example ../.env

python app.py
# → http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install

# Copy and edit environment variables (optional for dev)
cp .env.example .env.local

npm run dev
# → http://localhost:3000
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000` automatically.

---

## Docker (single-service)

```bash
# Build
docker build -t football-app .

# Run
docker run -p 5000:5000 \
  -e JWT_SECRET_KEY=your-secret-key \
  -e CORS_ORIGINS=http://localhost:3000 \
  football-app
```

---

## Deploying to Railway

### Option A — Two services (recommended)

1. **Backend service**
   - Root directory: `backend/`
   - Start command: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - Environment variables:
     ```
     JWT_SECRET_KEY=<strong-random-secret>
     CORS_ORIGINS=https://<your-frontend>.up.railway.app
     ```

2. **Frontend service**
   - Root directory: `frontend/`
   - Build command: `npm run build`
   - Start command: `npx serve dist`
   - Environment variables:
     ```
     VITE_API_URL=https://<your-backend>.up.railway.app
     ```

### Option B — Single Docker service

Deploy from the repo root using the provided `Dockerfile`.  
Set `JWT_SECRET_KEY` and `CORS_ORIGINS` in the Railway service variables.

---

## Environment Variables

### Backend (`.env`)

| Variable        | Default                  | Description                        |
|-----------------|--------------------------|------------------------------------|
| `JWT_SECRET_KEY`| `change-me-in-production`| Secret used to sign JWT tokens     |
| `CORS_ORIGINS`  | `*`                      | Allowed frontend origins           |
| `FLASK_DEBUG`   | `false`                  | Enable Flask debug mode            |
| `PORT`          | `5000`                   | Port to listen on                  |

### Frontend (`.env.local`)

| Variable       | Default | Description                                      |
|----------------|---------|--------------------------------------------------|
| `VITE_API_URL` | *(empty)*| Backend base URL (empty = use Vite proxy in dev)|

---

## Notes

- User data is stored **in-memory** — it resets on every server restart. For production, replace the `users` dict and `posts` list with a real database (e.g. PostgreSQL via SQLAlchemy).
- The JWT token expires after **12 hours**. The frontend automatically redirects to `/login` on a 401 response.
