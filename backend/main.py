from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

CRYPTO_SHORTS = {"BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA"}

def resolve(ticker: str) -> str:
    t = ticker.upper().strip()
    return t + "-USD" if t in CRYPTO_SHORTS else t

def calc_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

@app.get("/analyze/{ticker}")
def analyze(ticker: str, period: str = "3mo"):
    yf_ticker = resolve(ticker)

    # Always fetch 1y of data so MA200 has enough history, then trim to requested period
    full_df = yf.download(yf_ticker, period="2y", auto_adjust=True, progress=False)
    if full_df.empty:
        raise HTTPException(status_code=404, detail=f"No data found for '{ticker}'")

    full_df.columns = full_df.columns.get_level_values(0)
    close_full = full_df["Close"]
    full_df["MA20"]  = close_full.rolling(20).mean()
    full_df["MA200"] = close_full.rolling(200).mean()
    full_df["RSI"]   = calc_rsi(close_full)

    # Trim to requested period for display
    period_map = {"1mo": 30, "3mo": 90, "6mo": 180, "1y": 365}
    days = period_map.get(period, 90)
    df = full_df.iloc[-days:]

    close   = df["Close"]
    price   = float(close.iloc[-1])
    ma20    = float(df["MA20"].iloc[-1])
    ma200   = float(df["MA200"].iloc[-1]) if not pd.isna(df["MA200"].iloc[-1]) else None
    rsi_val = float(df["RSI"].iloc[-1])

    trend    = "trending upward" if price > ma20 else "trending downward"
    if rsi_val > 70:
        momentum, risk = "overbought", "high risk"
    elif rsi_val < 30:
        momentum, risk = "oversold", "buying opportunity"
    else:
        momentum, risk = "neutral momentum", "moderate risk"

    candles = []
    for date, row in df.iterrows():
        candles.append({
            "date":  date.strftime("%Y-%m-%d"),
            "open":  round(float(row["Open"]), 2),
            "high":  round(float(row["High"]), 2),
            "low":   round(float(row["Low"]),  2),
            "close": round(float(row["Close"]), 2),
            "ma20":  round(float(row["MA20"]),  2) if not pd.isna(row["MA20"])  else None,
            "ma200": round(float(row["MA200"]), 2) if not pd.isna(row["MA200"]) else None,
            "rsi":   round(float(row["RSI"]),   2) if not pd.isna(row["RSI"])   else None,
        })

    return {
        "ticker":   ticker.upper(),
        "price":    price,
        "ma20":     ma20,
        "ma200":    ma200,
        "rsi":      rsi_val,
        "trend":    trend,
        "momentum": momentum,
        "risk":     risk,
        "signal":   f"{ticker.upper()} is {trend} but {momentum} → {risk}",
        "candles":  candles,
    }

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    close  = df["Close"]
    volume = df["Volume"]

    feat = pd.DataFrame(index=df.index)
    feat["rsi"]          = calc_rsi(close)
    feat["ma20"]         = close.rolling(20).mean()
    feat["ma50"]         = close.rolling(50).mean()
    feat["ma200"]        = close.rolling(200).mean()
    feat["price_ma20"]   = close / feat["ma20"]       # price relative to MA20
    feat["price_ma200"]  = close / feat["ma200"]      # price relative to MA200
    feat["ma20_ma200"]   = feat["ma20"] / feat["ma200"]  # golden/death cross ratio
    feat["ret_1d"]       = close.pct_change(1)
    feat["ret_5d"]       = close.pct_change(5)
    feat["ret_10d"]      = close.pct_change(10)
    feat["volatility"]   = close.pct_change().rolling(10).std()
    feat["vol_change"]   = volume.pct_change(5)
    feat["high_low_pct"] = (df["High"] - df["Low"]) / close  # daily range %

    # Label: 1 if next day close is higher, 0 otherwise
    feat["target"] = (close.shift(-1) > close).astype(int)

    return feat.dropna()


@app.get("/predict/{ticker}")
def predict(ticker: str):
    yf_ticker = resolve(ticker)

    # Fetch 5 years for a solid training set
    df = yf.download(yf_ticker, period="5y", auto_adjust=True, progress=False)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"No data found for '{ticker}'")
    df.columns = df.columns.get_level_values(0)

    feat = build_features(df)
    if len(feat) < 100:
        raise HTTPException(status_code=400, detail="Not enough historical data to train model")

    feature_cols = [c for c in feat.columns if c != "target"]
    X = feat[feature_cols].values
    y = feat["target"].values

    # Train on all but the last row; predict on the last row (today)
    X_train, X_today = X[:-1], X[-1:]
    y_train          = y[:-1]

    scaler  = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_today = scaler.transform(X_today)

    model = RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    prob_up   = float(model.predict_proba(X_today)[0][1])
    direction = "up" if prob_up >= 0.5 else "down"

    # Feature importances for transparency
    importances = dict(zip(feature_cols, model.feature_importances_.tolist()))
    top_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "ticker":      ticker.upper(),
        "prob_up":     round(prob_up * 100, 1),
        "prob_down":   round((1 - prob_up) * 100, 1),
        "direction":   direction,
        "confidence":  "high" if abs(prob_up - 0.5) > 0.15 else "moderate" if abs(prob_up - 0.5) > 0.07 else "low",
        "top_features": [{"name": k, "importance": round(v * 100, 1)} for k, v in top_features],
        "signal":      f"There's a {round(prob_up * 100, 1)}% chance {ticker.upper()} goes {direction} tomorrow",
    }
