from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def health():
    return {"response": "OK"}

@app.get("/hello/")
def hello():
    return {"response": "Hello from backend"}