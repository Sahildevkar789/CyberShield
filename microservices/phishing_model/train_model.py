import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import joblib

# Sample dataset (small demo)
data = {
    "url_length": [20, 75, 30, 90],
    "has_ip": [0, 1, 0, 1],
    "has_https": [1, 0, 1, 0],
    "num_dots": [1, 4, 2, 5],
    "label": [0, 1, 0, 1]  # 0=Safe, 1=Phishing
}

df = pd.DataFrame(data)

X = df.drop("label", axis=1)
y = df["label"]

model = LogisticRegression()
model.fit(X, y)

joblib.dump(model, "phishing_model.pkl")

print("Model trained & saved!")
