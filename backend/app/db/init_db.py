from app.db.database import Base, engine
from app.models import User, Job, Candidate, Application  # noqa


def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created.")


if __name__ == "__main__":
    init_db()