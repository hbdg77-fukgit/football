import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity, get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

app = Flask(__name__)

# ── Configuration ──────────────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)

CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})
jwt = JWTManager(app)

# ── In-memory storage ──────────────────────────────────────────────────────────
# users: { username: { password_hash, role } }
users: dict = {}
# posts: [ { id, title, content, author, created_at } ]
posts: list = []
_post_id_counter: list = [0]   # mutable counter (avoids global keyword)


def next_post_id() -> int:
    _post_id_counter[0] += 1
    return _post_id_counter[0]


# ── Helpers ────────────────────────────────────────────────────────────────────
def error(msg: str, status: int = 400):
    return jsonify({"error": msg}), status


def ok(data: dict, status: int = 200):
    return jsonify(data), status


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return ok({"status": "ok", "users": len(users), "posts": len(posts)})


@app.route("/api/register", methods=["POST"])
def register():
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    role = (body.get("role") or "user").strip().lower()

    if not username or not password:
        return error("username and password are required")
    if len(username) < 3:
        return error("username must be at least 3 characters")
    if len(password) < 6:
        return error("password must be at least 6 characters")
    if role not in ("user", "admin"):
        return error("role must be 'user' or 'admin'")
    if username in users:
        return error("username already taken", 409)

    users[username] = {
        "password_hash": generate_password_hash(password),
        "role": role,
    }
    return ok({"message": "registered successfully", "username": username, "role": role}, 201)


@app.route("/api/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""

    if not username or not password:
        return error("username and password are required")

    user = users.get(username)
    if not user or not check_password_hash(user["password_hash"], password):
        return error("invalid credentials", 401)

    additional_claims = {"role": user["role"]}
    token = create_access_token(identity=username, additional_claims=additional_claims)
    return ok({"access_token": token, "username": username, "role": user["role"]})


@app.route("/api/posts", methods=["GET"])
@jwt_required()
def get_posts():
    return ok({"posts": posts})


@app.route("/api/posts", methods=["POST"])
@jwt_required()
def create_post():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return error("admin access required", 403)

    body = request.get_json(silent=True) or {}
    title = (body.get("title") or "").strip()
    content = (body.get("content") or "").strip()

    if not title or not content:
        return error("title and content are required")

    from datetime import datetime, timezone
    post = {
        "id": next_post_id(),
        "title": title,
        "content": content,
        "author": get_jwt_identity(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    posts.append(post)
    return ok({"message": "post created", "post": post}, 201)


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
