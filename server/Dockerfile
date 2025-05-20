FROM python:3.10

WORKDIR /server

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app

# CMD ["python", "-m", "app.main"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]