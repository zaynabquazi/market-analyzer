import sys
import yfinance as yf
import pandas as pd


def get_data(ticker: str, period: str = "3mo") -> pd.DataFrame:
    df = yf.download(ticker, period=period, auto_adjust=True, progress=False)
    if df.empty:
        raise ValueError(f"No data found for ticker '{ticker}'. Check the symbol and try again.")
    return df


def moving_average(close: pd.Series, window: int = 20) -> float:
    return close.rolling(window).mean().iloc[-1]


def rsi(close: pd.Series, period: int = 14) -> float:
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss
    return float(100 - (100 / (1 + rs.iloc[-1])))


def interpret(ticker: str, price: float, ma: float, rsi_val: float) -> str:
    trend = "trending upward" if price > ma else "trending downward"

    if rsi_val > 70:
        momentum = "overbought"
        risk = "high risk"
    elif rsi_val < 30:
        momentum = "oversold"
        risk = "potential buying opportunity"
    else:
        momentum = "neutral momentum"
        risk = "moderate risk"

    return f'"{ticker} is {trend} but {momentum} → {risk}"'


def analyze(ticker: str):
    ticker = ticker.upper()
    # yfinance uses BTC-USD for crypto
    yf_ticker = ticker if "-" in ticker else (ticker + "-USD" if ticker in ("BTC", "ETH", "SOL") else ticker)

    print(f"\nFetching data for {ticker}...")
    df = get_data(yf_ticker)

    close = df["Close"].squeeze()
    price = float(close.iloc[-1])
    ma20 = float(moving_average(close))
    rsi_val = rsi(close)

    print(f"\n  Price:       ${price:.2f}")
    print(f"  MA(20):      ${ma20:.2f}")
    print(f"  RSI(14):     {rsi_val:.1f}")
    print(f"\n  Signal: {interpret(ticker, price, ma20, rsi_val)}\n")


if __name__ == "__main__":
    ticker = sys.argv[1] if len(sys.argv) > 1 else input("Enter ticker (e.g. AAPL or BTC): ").strip()
    try:
        analyze(ticker)
    except ValueError as e:
        print(f"\nError: {e}")
        sys.exit(1)
