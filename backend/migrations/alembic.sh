alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# sh migrations/alembic.sh