"""
MedSimplify Backend Main (Subdirectory Mirror)
"""
from backend.main import app, analyze_report_endpoint, chat_report_endpoint, health_check

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)