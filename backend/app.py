import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

app = Flask(__name__)

# ── Configuration ────────────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)

CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGIN", "*")}})
jwt = JWTManager(app)

# ── In-memory stores (swap for PostgreSQL via SQLAlchemy when ready) ─────────
# users: { username: { "password_hash": str, "role": "user"|"admin" } }
users: dict[str, dict] = {}

# posts: [ { "id": int, "title": str, "body": str, "author": str } ]
posts: list[dict] = []
_post_id_counter = 1


# ── Helpers ──────────────────────────────────────────────────────────────────
def _user_exists(username: str) -> bool:
    return username in users


def _next_post_id() -> int:
    global _post_id_counter
    pid = _post_id_counter
    _post_id_counter += 1
    return pid


# ── Auth routes ──────────────────────────────────────────────────────────────
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    role = data.get("role", "user")  # allow "admin" only for seeding / trusted clients

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "password must be at least 6 characters"}), 400

    if _user_exists(username):
        return jsonify({"error": "username already taken"}), 409

    if role not in ("user", "admin"):
        role = "user"

    users[username] = {
        "password_hash": generate_password_hash(password),
        "role": role,
    }

    return jsonify({"message": "user registered successfully"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    user = users.get(username)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "invalid credentials"}), 401

    additional_claims = {"role": user["role"]}
    access_token = create_access_token(
        identity=username, additional_claims=additional_claims
    )

    return jsonify(
        {
            "access_token": access_token,
            "username": username,
            "role": user["role"],
        }
    ), 200


# ── Post routes ──────────────────────────────────────────────────────────────
@app.route("/api/posts", methods=["GET"])
@jwt_required()
def get_posts():
    return jsonify(posts), 200


@app.route("/api/posts", methods=["POST"])
@jwt_required()
def create_post():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "admin access required"}), 403

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    body = (data.get("body") or "").strip()

    if not title or not body:
        return jsonify({"error": "title and body are required"}), 400

    author = get_jwt_identity()
    post = {
        "id": _next_post_id(),
        "title": title,
        "body": body,
        "author": author,
    }
    posts.append(post)

    return jsonify(post), 201


# ── Health check ─────────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "production") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
