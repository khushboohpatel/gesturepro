# GesturePro Developer Setup Guide


## 📁 Project Structure

```
gesturepro/
├── client/           # Next.js frontend
│   └── src/
│       └── app/
├── server/           # FastAPI backend
│   └── app/
│       ├── api/
│       ├── models/
│       ├── services/
│       └── utils/
├── docker-compose.yml
├── .env              # Environment variables for Docker Compose
└── README.md
```


## ✅ Prerequisites

- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop) 
- [Node.js](https://nodejs.org/en/download) v22.15.1 (for manual frontend development)
- [Python](https://www.python.org/downloads/) 3.11+ (for manual backend development)


## 🔐 Environment Variables

Create a `.env` file in the root directory (where `docker-compose.yml` is located).

### Sample `.env`

```env
# PostgreSQL
POSTGRES_USER=<check-with-team>>
POSTGRES_PASSWORD=<check-with-team>>
POSTGRES_DB=gesturepro

# Backend DB connection
DB_HOST=db
DB_PORT=5432
DB_NAME=gesturepro
DB_USER=<<check-with-team>>
DB_PASSWORD=<check-with-team>>

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ⚠️ Do not commit `.env` to version control if it contains secrets.  
> ✅ The backend and database use the same credentials for seamless Docker Compose integration.


## ⚙️ Backend Setup (FastAPI + PostgreSQL)

### 🐳 Running with Docker (Recommended)
Handled automatically by Docker Compose (see below).

### 🧪 Running Manually (Development)

1. **Install dependencies**
    ```bash
    cd server
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

2. **Set environment variables**
    Use the `.env` file or manually export them.

3. **Create tables**
    Tables are auto-created at app startup (no need for Alembic during development).

4. **Run the backend**
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```


## 🌐 Frontend Setup (Next.js)

### 🐳 Running with Docker (Recommended)
Handled automatically by Docker Compose.

### 🧪 Running Manually (Development)

1. **Install dependencies**
    ```bash
    cd client
    npm install
    ```

2. **Set environment variables**
    Ensure `NEXT_PUBLIC_API_URL` is set in `.env.local` or `.env`.

3. **Run the frontend**
    ```bash
    npm run dev
    ```

4. **Access app**  
   [http://localhost:3000](http://localhost:3000)


## 🧩 Running with Docker Compose (Recommended Full Setup)

1. **Build and start all services**
    ```bash
    docker-compose up --build -d
    ```

2. **Access the applications:**
    - Frontend: http://localhost:3000
    - Backend (Swagger docs): http://localhost:8000/docs
    - PostgreSQL: Exposed on port `5432`

3. **Stop services**
    ```bash
    docker-compose down
    ```


## 🛠️ Common Issues & Troubleshooting

### 🔄 Database connection errors
- Ensure `DB_*` vars match `POSTGRES_*`
- Confirm `db` service is healthy

### ❌ Table does not exist
- Backend auto-creates tables
- If schema changes, try removing volume:
    ```bash
    docker-compose down -v
    ```

### 🌍 CORS errors
- The backend allows `http://localhost:3000` by default  
- Modify `allow_origins` in `main.py` if needed

### 🔗 Frontend can’t reach backend
- Ensure `NEXT_PUBLIC_API_URL` is correctly set to `http://localhost:8000`


## 💡 Development Tips

- **Backend**: Use `--reload` with `uvicorn` for live reload.
- **Frontend**: Next.js auto-reloads on save.
- **Health checks**: Docker Compose waits for healthy DB/backend before starting others.
- **New environment variables**: Update both `.env` and `docker-compose.yml` accordingly.

