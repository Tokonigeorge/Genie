from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Genie backend is running!"}