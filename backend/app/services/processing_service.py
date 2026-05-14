import json
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.candidate import Candidate
from app.utils.resume_parser import extract_text_from_resume
from app.services.gemini_service import GeminiService


class ResumeProcessingService:

    @staticmethod
    def process_candidate(db: Session, candidate_id: int) -> dict:
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found.")
        result = {"candidate_id": candidate_id, "status": "pending", "error": None}
        try:
            raw_text = extract_text_from_resume(candidate.resume_path)
            candidate.resume_text = raw_text
            parsed = GeminiService.parse_resume(raw_text)
            candidate.name             = parsed.get("full_name") or candidate.name
            candidate.email            = parsed.get("email")     or candidate.email
            candidate.phone            = parsed.get("phone")     or candidate.phone
            candidate.experience       = parsed.get("experience_years")
            candidate.skills           = json.dumps(parsed.get("skills", []))
            candidate.education        = json.dumps(parsed.get("education", []))
            candidate.summary          = parsed.get("summary")
            candidate.is_processed     = True
            candidate.processing_error = None
            db.commit()
            db.refresh(candidate)
            result.update({"status": "success", "full_name": candidate.name,
                           "email": candidate.email, "skills": parsed.get("skills", []),
                           "experience_years": candidate.experience, "summary": candidate.summary})
        except Exception as exc:
            candidate.is_processed = False
            candidate.processing_error = str(exc)
            db.commit()
            result.update({"status": "failed", "error": str(exc)})
        return result

    @staticmethod
    def process_all_for_job(db: Session, job_id: int) -> dict:
        from app.models.application import Application
        apps = db.query(Application).filter(Application.job_id == job_id).all()
        if not apps:
            raise HTTPException(status_code=404, detail=f"No candidates for job {job_id}.")
        results = []
        successful = failed = 0
        for app in apps:
            candidate = db.query(Candidate).filter(Candidate.id == app.candidate_id).first()
            if not candidate or candidate.is_processed:
                results.append({"candidate_id": app.candidate_id, "status": "skipped"})
                continue
            outcome = ResumeProcessingService.process_candidate(db, app.candidate_id)
            results.append(outcome)
            if outcome["status"] == "success":
                successful += 1
            else:
                failed += 1
        return {"job_id": job_id, "total": len(apps), "successful": successful, "failed": failed, "results": results}