# Get python version in a debian:slim-buster os
FROM python:3.8-slim-buster

# Make a work directory
WORKDIR /app

# Copy requimerements to setup our enviroment with all dependencies
COPY requirements.txt /app

# Install dependencies
RUN pip3 install -r requirements.txt

# Copy the drf app
COPY . .

# Run drf app 
CMD ["python3", "src/manage.py", "runserver"]

