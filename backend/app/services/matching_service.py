import json
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.models.job import Job
from app.models.candidate import Candidate
from app.models.application import Application, ApplicationStatus
from app.utils.skill_normalizer import normalize_list, normalize
from app.utils.experience_parser import experience_score

SKILL_WEIGHT      = 0.75
EXPERIENCE_WEIGHT = 0.25


def compute_skill_score(required, candidate_skills):
    if not required:
        return 0.0, [], []
    norm_required  = normalize_list(required)
    norm_candidate = set(normalize_list(candidate_skills))
    matched = [s for s in norm_required if s in norm_candidate]
    missing = [s for s in norm_required if s not in norm_candidate]
    score   = (len(matched) / len(norm_required)) * 100
    return round(score, 2), matched, missing


def compute_final_score(skill_score, exp_score):
    return round((skill_score * SKILL_WEIGHT) + (exp_score * EXPERIENCE_WEIGHT), 2)


def _load_skills(raw):
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(s) for s in data if s]
    except Exception:
        pass
    return [s.strip() for s in raw.split(",") if s.strip()]


class MatchingService:

    @staticmethod
    def match_candidates_for_job(db: Session, job_id: int) -> dict:
        job = db.query(Job).options(joinedload(Job.applications).joinedload(Application.candidate)).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
        if not job.applications:
            return {"job_id": job_id, "job_title": job.title, "total": 0, "ranked": 0, "skipped": 0, "required_skills": [], "candidates": []}

        job_skills = [s.strip() for s in (job.skills_required or "").split(",") if s.strip()]
        if not job_skills:
            raise HTTPException(status_code=400, detail="Job has no required skills.")

        scored = []
        for app in job.applications:
            c = app.candidate
            if not c:
                continue
            if not c.is_processed:
                scored.append({"_app": app, "_candidate": c, "candidate_id": c.id, "full_name": c.name or "Unknown",
                               "email": c.email, "file_type": c.file_type, "skills": [], "experience_years": c.experience,
                               "summary": c.summary, "skill_score": 0.0, "exp_score": 0.0, "final_score": 0.0,
                               "matched_skills": [], "missing_skills": job_skills, "rank": None, "status": app.status,
                               "skipped": True, "skip_reason": "Resume not processed"})
                continue
            cskills = _load_skills(c.skills)
            skill_score, matched, missing = compute_skill_score(job_skills, cskills)
            exp_s  = experience_score(c.experience, job.experience)
            final  = compute_final_score(skill_score, exp_s)
            scored.append({"_app": app, "_candidate": c, "candidate_id": c.id, "full_name": c.name or "Unknown",
                           "email": c.email, "file_type": c.file_type, "skills": cskills, "experience_years": c.experience,
                           "summary": c.summary, "skill_score": skill_score, "exp_score": exp_s, "final_score": final,
                           "matched_skills": matched, "missing_skills": missing, "rank": None, "status": app.status,
                           "skipped": False, "skip_reason": None})

        processed   = sorted([r for r in scored if not r["skipped"]], key=lambda x: (x["final_score"], x["skill_score"]), reverse=True)
        unprocessed = [r for r in scored if r["skipped"]]

        for rank, row in enumerate(processed, start=1):
            row["rank"] = rank
            app = row["_app"]
            app.score          = row["final_score"]
            app.match_summary  = row["summary"]
            app.matched_skills = json.dumps(row["matched_skills"])
            app.missing_skills = json.dumps(row["missing_skills"])
            app.rank           = rank
        db.commit()

        def fmt(r):
            return {"rank": r["rank"], "candidate_id": r["candidate_id"], "full_name": r["full_name"],
                    "email": r["email"], "file_type": r["file_type"], "experience_years": r["experience_years"],
                    "summary": r["summary"], "skill_score": r["skill_score"], "experience_score": r["exp_score"],
                    "final_score": r["final_score"], "matched_skills": r["matched_skills"],
                    "missing_skills": r["missing_skills"],
                    "application_status": r["status"].value if hasattr(r["status"], "value") else str(r["status"]),
                    "skipped": r["skipped"], "skip_reason": r["skip_reason"]}

        return {"job_id": job_id, "job_title": job.title, "required_skills": job_skills,
                "total": len(scored), "ranked": len(processed), "skipped": len(unprocessed),
                "candidates": [fmt(r) for r in processed + unprocessed]}

    @staticmethod
    def score_single(db: Session, job_id: int, candidate_id: int) -> dict:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
        c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not c:
            raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found.")
        job_skills = [s.strip() for s in (job.skills_required or "").split(",") if s.strip()]
        cskills = _load_skills(c.skills)
        skill_score, matched, missing = compute_skill_score(job_skills, cskills)
        exp_s  = experience_score(c.experience, job.experience)
        final  = compute_final_score(skill_score, exp_s)
        return {"job_id": job_id, "job_title": job.title, "candidate_id": candidate_id,
                "full_name": c.name, "required_skills": job_skills, "candidate_skills": cskills,
                "matched_skills": matched, "missing_skills": missing, "skill_score": skill_score,
                "experience_score": exp_s, "final_score": final,
                "score_breakdown": {"formula": "final = (skill×0.75) + (exp×0.25)",
                                    "skill_score": f"{skill_score}×0.75={round(skill_score*0.75,2)}",
                                    "exp_score": f"{exp_s}×0.25={round(exp_s*0.25,2)}", "final_score": final}}