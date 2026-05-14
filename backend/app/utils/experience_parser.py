import re

_FRESHER_LABELS = {"fresher", "fresh graduate", "entry level", "0", "0 years"}


def parse_experience_years(text) -> float:
    if not text:
        return -1.0
    cleaned = text.strip().lower()
    if cleaned in _FRESHER_LABELS:
        return 0.0
    range_match = re.search(r"(\d+(?:\.\d+)?)\s*[-–]+\s*(\d+(?:\.\d+)?)", cleaned)
    if range_match:
        return (float(range_match.group(1)) + float(range_match.group(2))) / 2
    single = re.search(r"(\d+(?:\.\d+)?)", cleaned)
    if single:
        return float(single.group(1))
    return -1.0


def experience_score(candidate_exp, job_exp) -> float:
    c = parse_experience_years(candidate_exp)
    j = parse_experience_years(job_exp)
    if c < 0 or j < 0:
        return 50.0
    if c >= j:
        return 100.0
    gap = j - c
    if gap <= 1:
        return 80.0
    if gap <= 2:
        return 60.0
    return 30.0