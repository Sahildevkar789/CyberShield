FROM python:3.10

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Train the model at build time so the container has phishing_model.pkl
RUN python train_model.py

EXPOSE 5004

CMD ["python", "app.py"]

