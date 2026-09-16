from app.database import engine, Base
from app.models import Company, User, Document, Conversation, Order  # noqa: F401

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done! Tables created.")