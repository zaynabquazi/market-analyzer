import streamlit as st
import yfinance as yf
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# ── page config ──────────────────────────────────────────────────────────────
st.set_page_config(page_title="🔥 Market Analyzer", layout="wide", page_icon="🔥")

st.markdown("""
<style>
  .block-container { padding-top: 2rem; }
  .signal-box {
    background: #1a1a2e;
    border-left: 4px solid #e94560;
    border-radius: 8px;
    padding: 1.2rem 1.5rem;
    font-size: 1.2rem;
    color: #eaeaea;
    margin-top: 1rem;
  }
  .risk-high   { color: #e94560; font-weight: 700; }
  .risk-mod    { color: #f5a623; font-weight: 700; }
  .risk-low    { color: #2ecc71; font-weight: 700; }
</style>
""", unsafe_allow_html=True)

# ── helpers ───────────────────────────────────────────────────────────────────
CRYPTO_SHORTS = {"BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA"}

def resolve_ticker(raw: str) -> str:
    t = raw.upper().strip()
    return t + "-USD" if t in CRYPTO_SHORTS else t

def fetch(ticker: str, period: str) -> pd.DataFrame:
    df = yf.download(ticker, period=period, auto_adjust=True, progress=False)
    if df.empty:
        raise ValueError(f"No data for '{ticker}'")
    df.columns = df.columns.get_level_values(0)
    return df

def calc_ma(close: pd.Series, w: int = 20) -> pd.Series:
    return close.rolling(w).mean()

def calc_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def signal(ticker: str, price: float, ma: float, rsi_val: float) -> tuple[str, str]:
    trend = "trending upward" if price > ma else "trending downward"
    if rsi_val > 70:
        momentum, risk, cls = "overbought", "high risk", "risk-high"
    elif rsi_val < 30:
        momentum, risk, cls = "oversold", "buying opportunity", "risk-low"
    else:
        momentum, risk, cls = "neutral momentum", "moderate risk", "risk-mod"
    text = f'"{ticker} is {trend} but {momentum} → <span class="{cls}">{risk}</span>"'
    return text, cls

# ── sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.title("🔥 Market Analyzer")
    raw_ticker = st.text_input("Ticker symbol", value="AAPL", placeholder="AAPL, BTC, TSLA…").upper()
    period = st.selectbox("Period", ["1mo", "3mo", "6mo", "1y"], index=1)
    run = st.button("Analyze", use_container_width=True, type="primary")
    st.markdown("---")
    st.caption("Supports stocks & crypto. Crypto short-codes (BTC, ETH…) are auto-mapped to USD pairs.")

# ── main ──────────────────────────────────────────────────────────────────────
st.title("🔥 Your exact setup (perfect MVP)")

if run or raw_ticker:
    ticker = resolve_ticker(raw_ticker)
    with st.spinner(f"Fetching {ticker}…"):
        try:
            df = fetch(ticker, period)
        except ValueError as e:
            st.error(str(e))
            st.stop()

    close = df["Close"]
    df["MA20"] = calc_ma(close)
    df["RSI"]  = calc_rsi(close)

    price   = float(close.iloc[-1])
    ma_val  = float(df["MA20"].iloc[-1])
    rsi_val = float(df["RSI"].iloc[-1])

    # ── metric cards ─────────────────────────────────────────────────────────
    c1, c2, c3 = st.columns(3)
    c1.metric("Current Price", f"${price:,.2f}")
    c2.metric("MA (20)", f"${ma_val:,.2f}", delta=f"{((price - ma_val) / ma_val * 100):+.1f}%")
    rsi_delta = "Overbought" if rsi_val > 70 else ("Oversold" if rsi_val < 30 else "Neutral")
    c3.metric("RSI (14)", f"{rsi_val:.1f}", delta=rsi_delta)

    # ── signal box ───────────────────────────────────────────────────────────
    sig_text, _ = signal(raw_ticker.upper(), price, ma_val, rsi_val)
    st.markdown(f'<div class="signal-box">{sig_text}</div>', unsafe_allow_html=True)

    # ── chart ─────────────────────────────────────────────────────────────────
    fig = make_subplots(rows=2, cols=1, shared_xaxes=True,
                        row_heights=[0.7, 0.3], vertical_spacing=0.04)

    fig.add_trace(go.Candlestick(
        x=df.index, open=df["Open"], high=df["High"],
        low=df["Low"], close=close, name="Price",
        increasing_line_color="#2ecc71", decreasing_line_color="#e94560"
    ), row=1, col=1)

    fig.add_trace(go.Scatter(
        x=df.index, y=df["MA20"], name="MA(20)",
        line=dict(color="#f5a623", width=1.5)
    ), row=1, col=1)

    fig.add_trace(go.Scatter(
        x=df.index, y=df["RSI"], name="RSI(14)",
        line=dict(color="#a29bfe", width=1.5)
    ), row=2, col=1)

    # overbought / oversold bands
    fig.add_hrect(y0=70, y1=100, row=2, col=1,
                  fillcolor="#e94560", opacity=0.1, line_width=0)
    fig.add_hrect(y0=0, y1=30, row=2, col=1,
                  fillcolor="#2ecc71", opacity=0.1, line_width=0)
    fig.add_hline(y=70, row=2, col=1, line=dict(color="#e94560", dash="dash", width=1))
    fig.add_hline(y=30, row=2, col=1, line=dict(color="#2ecc71", dash="dash", width=1))

    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="#0e1117",
        plot_bgcolor="#0e1117",
        xaxis_rangeslider_visible=False,
        legend=dict(orientation="h", y=1.02),
        margin=dict(l=0, r=0, t=30, b=0),
        height=560,
    )
    fig.update_yaxes(title_text="Price (USD)", row=1, col=1)
    fig.update_yaxes(title_text="RSI", row=2, col=1, range=[0, 100])

    st.plotly_chart(fig, use_container_width=True)
