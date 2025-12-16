import os
import signal
import subprocess
import time
import psutil

# 1. Write the correct .env file
env_content = """APP_NAME="AI-Powered Financial Tracker"
DEBUG=True
API_V1_PREFIX="/api/v1"
DATABASE_URL="sqlite+aiosqlite:///./financial_tracker.db"
DATABASE_URL_SYNC="sqlite:///./financial_tracker.db"
SECRET_KEY="your-super-secret-key-change-this-in-production"
ACCESS_TOKEN_EXPIRE_MINUTES=11520
REFRESH_TOKEN_EXPIRE_DAYS=30
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
"""

print("Writing .env file...")
with open("backend/.env", "w") as f:
    f.write(env_content)
print(".env file written successfully.")

# 2. Kill any process on port 8000
print("Checking for existing backend process...")
for proc in psutil.process_iter(['pid', 'name']):
    try:
        for conn in proc.connections(kind='inet'):
            if conn.laddr.port == 8000:
                print(f"killing process {proc.pid} on port 8000")
                proc.send_signal(signal.SIGTERM)
                proc.wait(timeout=5)
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
        pass

# 3. Start Uvicorn
print("Starting Uvicorn...")
# We use shell=True to effectively run in the venv if activated, but proper way is accessing venv python
# Assuming we run this script FROM the active venv or call the venv python directly.
# Best way: Use the full path to venv python.
venv_python = os.path.join("backend", "venv", "Scripts", "python.exe")
if not os.path.exists(venv_python):
    print(f"Warning: {venv_python} not found, trying 'python'")
    venv_python = "python"

cmd = [venv_python, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
# subprocess.Popen(cmd, cwd="backend") # Run in backend dir?
# The app.main:app import looks for app/ inside current path.
# If we run from project root, we need to set PYTHONPATH or change dir.
# Existing commands ran from project root with `cd backend; ...`
# So we should run from `backend` directory.

print(f"Running command: {' '.join(cmd)}")
process = subprocess.Popen(cmd, cwd="backend")
print(f"Backend started with PID {process.pid}")
