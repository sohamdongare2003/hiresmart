from typing import List
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.candidate import Candidate
from app.models.application import Application, ApplicationStatus
from app.schemas.candidate import BulkUploadResponse, CandidateUploadResult

from app.utils.file_validator import (
    validate_resume_file,
    validate_file_count
)

from app.utils.storage import (
    save_file_locally,
    delete_file_locally
)

from app.utils.resume_parser import (
    extract_text_from_resume,
    extract_candidate_data
)


class CandidateService:

    @staticmethod
    async def bulk_upload(
        db: Session,
        files: List[UploadFile],
        job_id: int
    ) -> BulkUploadResponse:

        validate_file_count(files)

        results = []
        successful = 0
        failed = 0

        for file in files:

            filename = file.filename or "unknown"

            try:

                content = await validate_resume_file(file)

                storage_info = save_file_locally(
                    content,
                    filename,
                    job_id
                )

                resume_text = extract_text_from_resume(
                    storage_info["file_path"]
                )

                parsed_data = extract_candidate_data(
                    resume_text
                )

                candidate = Candidate(
                    name=parsed_data["name"],
                    email=parsed_data["email"],
                    phone=parsed_data["phone"],
                    skills=parsed_data["skills"],
                    experience=parsed_data["experience"],

                    resume_text=resume_text,

                    original_filename=filename,
                    stored_filename=storage_info["stored_filename"],
                    resume_path=storage_info["file_path"],
                    file_size=storage_info["file_size"],
                    file_type=storage_info["file_type"],

                    is_processed=True
                )

                db.add(candidate)
                db.flush()

                application = Application(
                    job_id=job_id,
                    candidate_id=candidate.id,
                    score=0.0,
                    status=ApplicationStatus.pending,
                )

                db.add(application)

                db.commit()

                db.refresh(candidate)

                results.append(
                    CandidateUploadResult(
                        original_filename=filename,
                        status="success",
                        candidate_id=candidate.id,
                        file_path=storage_info["file_path"],
                        file_size_kb=round(
                            storage_info["file_size"] / 1024,
                            2
                        ),
                        file_type=storage_info["file_type"],
                    )
                )

                successful += 1

            except Exception as exc:

                db.rollback()

                results.append(
                    CandidateUploadResult(
                        original_filename=filename,
                        status="failed",
                        error=str(exc.detail)
                        if hasattr(exc, "detail")
                        else str(exc),
                    )
                )

                failed += 1

        return BulkUploadResponse(
            total_uploaded=len(files),
            successful=successful,
            failed=failed,
            results=results,
        )

    @staticmethod
    def get_candidate_by_id(
        db: Session,
        candidate_id: int
    ) -> Candidate:

        from fastapi import HTTPException

        c = (
            db.query(Candidate)
            .filter(Candidate.id == candidate_id)
            .first()
        )

        if not c:
            raise HTTPException(
                status_code=404,
                detail=f"Candidate {candidate_id} not found."
            )

        return c

    @staticmethod
    def delete_candidate(
        db: Session,
        candidate_id: int
    ) -> dict:

        from fastapi import HTTPException

        c = (
            db.query(Candidate)
            .filter(Candidate.id == candidate_id)
            .first()
        )

        if not c:
            raise HTTPException(
                status_code=404,
                detail=f"Candidate {candidate_id} not found."
            )

        delete_file_locally(c.resume_path)

        db.delete(c)

        db.commit()

        return {
            "message": f"Candidate {candidate_id} deleted."
        }