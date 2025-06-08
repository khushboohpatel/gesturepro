FROM python:3.10

# Install system dependencies for OpenCV, MediaPipe, and ML libraries
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgtk-3-0 \
    libgl1-mesa-glx \
    libfontconfig1 \
    libxrender1 \
    libxtst6 \
    libxi6 \
    libxrandr2 \
    libasound2 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for headless operation
ENV DISPLAY=:99
ENV QT_QPA_PLATFORM=offscreen
ENV OPENCV_IO_ENABLE_JASPER=true

WORKDIR /server

COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server/app/ ./app/

RUN mkdir -p ./ml/saved_models

ENV PYTHONPATH=/server

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]