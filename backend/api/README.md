# API & Database Module (Backend Lead)

**Owner:** Person 2
**Tech Stack:** FastAPI, Python, MongoDB Atlas, Pydantic

## Responsibilities
This directory contains the core web server and database logic.
- `main.py`: The FastAPI application entry point.
- `routes/`: API endpoints (e.g., `/upload`, `/screenings`, `/history`).
- `database.py`: MongoDB Atlas connection logic.
- `models/`: Pydantic schemas and database models.

Your goal is to receive requests from the frontend, call the scripts in the `vision` and `intelligence` folders, store the results in MongoDB, and send the response back.
