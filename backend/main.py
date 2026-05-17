from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings
from app.api.routes import auth, jobs, candidates, matching, applications

app = FastAPI(title="HireSmart API", version="1.0.0", docs_url="/docs")

allowed_origins = [
    "https://hiresmart-seven.vercel.app/",
    "https://hiresmart-git-main-sohamdongare2003s-projects.vercel.app",
    "https://hiresmart-22hu9sx9j-sohamdongare2003s-projects.vercel.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = Path(settings.LOCAL_UPLOAD_DIR)
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(matching.router)
app.include_router(applications.router)


@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"status": "ok", "app": settings.APP_NAME}
