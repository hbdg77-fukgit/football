# ⚽ Football App

A full-stack web application with user authentication, role-based access control, and a posts feed. Built with **Flask** (backend) and **React + Vite + Tailwind CSS** (frontend).

---

## Features

| Feature | Details |
|---|---|
| User registration | Choose `user` or `admin` role at sign-up |
| JWT authentication | Tokens stored in `localStorage`, auto-attached to every API request |
| Post viewing | All authenticated users can browse posts |
| Post creation | Admin-only — guarded on both the API and the UI |
| React Router | Client-side routing with protected route guards |

---

## Project Structure

```
football/
├── backend/
│   ├── app.py              # Flask application & API routes
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Posts.jsx
│   │   │   └── CreatePost.jsx
│   │   ├── services/
│   │   │   └── api.js      # Axios client
│   │   ├── App.jsx         # Router + route guards
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── Dockerfile              # Backend container
├── .env.example            # Backend env template
└── README.md
```

---

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1 — Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example ../.env
# Edit .env and set JWT_SECRET_KEY to a random string

# Start the dev server
flask --app app run --debug
# → http://localhost:5000
```

### 2 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional — Vite proxies /api to localhost:5000 by default)
cp .env.example .env

# Start the dev server
npm run dev
# → http://localhost:5173
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| `POST` | `/register` | — | `{ username, password, role? }` | Register a new user |
| `POST` | `/login` | — | `{ username, password }` | Login, returns JWT |

### Posts

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| `GET` | `/posts` | JWT | — | List all posts |
| `POST` | `/posts` | JWT + admin | `{ title, body }` | Create a post |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Returns `{ "status": "ok" }` |

---

## Deployment on Railway

### Backend

1. Create a new Railway service pointing to this repo.
2. Set the **Root Directory** to `/` (the `Dockerfile` is at the repo root).
3. Add the following environment variables in Railway:

   | Variable | Value |
   |---|---|
   | `JWT_SECRET_KEY` | A long random string |
   | `FLASK_ENV` | `production` |
   | `CORS_ORIGIN` | Your frontend Railway URL |

4. Railway will build the Docker image and deploy automatically.

### Frontend

1. Create a second Railway service (or use a static hosting provider like Vercel/Netlify).
2. Set **Root Directory** to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | Your backend Railway URL |

---

## Upgrading to PostgreSQL

The backend currently uses in-memory Python dicts (data resets on restart). To persist data:

1. Add `flask-sqlalchemy` and `psycopg2-binary` to `requirements.txt`.
2. Replace the `users` dict and `posts` list in `app.py` with SQLAlchemy models.
3. Set a `DATABASE_URL` environment variable (Railway provides this automatically when you attach a Postgres plugin).

---

## License

MIT
