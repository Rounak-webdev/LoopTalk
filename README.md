# LoopTalk

LoopTalk is a full-stack real-time style chat app scaffold with:
- **Frontend:** React + Vite + TailwindCSS + DaisyUI
- **Backend:** Express + MongoDB + JWT cookie auth + Cloudinary media upload

---

## Project Structure

```text
LoopTalk/
├─ Frontend/   # React client
└─ Backend/    # Express API server
```

---

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB connection string (local MongoDB or Atlas)
- Cloudinary account (for profile pictures and image messages)

---

## Environment Variables

Create `Backend/.env` with the following values:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string  # optional, defaults to mongodb://127.0.0.1:27017/looptalk
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## Run Locally

### 1) Install dependencies

```bash
cd Backend && npm install
cd ../Frontend && npm install
```

### 2) Start backend

```bash
cd Backend
npm run dev
```

Backend runs on `http://localhost:5001` (uses Node.js built-in `--watch`).

### 3) Start frontend

```bash
cd Frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

For frontend API URL override, create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

---

## Available API Routes

Base URL: `http://localhost:5001/api`

### Health
- `GET /health`

### Auth
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/check` (protected)
- `PUT /auth/update-profile` (protected)

### Messages
- `GET /messages/users` (protected)
- `GET /messages/:id` (protected)
- `POST /messages/send/:id` (protected)

---

## Quick Verification

From a separate terminal, after starting backend:

```bash
curl http://localhost:5001/api/health
```

Expected response:

```json
{"status":"ok"}
```

---

## Notes

- Authentication uses **HTTP-only JWT cookies**.
- CORS is configured for `FRONTEND_URL` (default `http://localhost:5173`).
- If MongoDB DNS fails (Atlas SRV issues), switch to a local MongoDB URI temporarily for development.
