# 🔥 Stock & Crypto Analyzer — Requirements

## Overview
A modern web dashboard that lets users type any stock or crypto ticker and instantly see technical analysis with a plain-English signal.

---

## Tech Stack
- **Frontend/UI**: Streamlit (Python-based web UI)
- **Data**: yfinance (Yahoo Finance API)
- **Charting**: Plotly (interactive price + indicator charts)
- **Language**: Python 3.9+

---

## User Flow

1. User opens the app in a browser
2. User types a ticker symbol (e.g. `AAPL`, `BTC`, `ETH`, `TSLA`)
3. App fetches 3 months of OHLCV data from Yahoo Finance
4. App calculates:
   - 20-day Simple Moving Average (MA20)
   - 14-period Relative Strength Index (RSI14)
5. App displays:
   - Current price, MA20, RSI value as metric cards
   - Interactive candlestick chart with MA20 overlay
   - RSI chart with overbought/oversold zones
   - Plain-English signal card (e.g. "AAPL is trending upward but slightly overbought → moderate risk")

---

## Signal Logic

| Condition | Trend | Momentum | Risk Label |
|---|---|---|---|
| Price > MA20 | Trending upward | — | — |
| Price < MA20 | Trending downward | — | — |
| RSI > 70 | — | Overbought | High risk |
| RSI 30–70 | — | Neutral | Moderate risk |
| RSI < 30 | — | Oversold | Buying opportunity |

---

## UI Requirements

- Dark theme dashboard
- Ticker search input at the top
- 3 metric cards: Price / MA(20) / RSI(14)
- Candlestick + MA line chart (interactive, zoomable)
- RSI chart with red/green zone bands
- Signal output styled as a highlighted quote block
- Responsive layout

---

## Supported Tickers
- Stocks: any valid Yahoo Finance symbol (e.g. `AAPL`, `TSLA`, `MSFT`)
- Crypto: short form auto-mapped to USD pair (`BTC` → `BTC-USD`, `ETH` → `ETH-USD`)

---

## Dependencies
```
streamlit>=1.30.0
yfinance>=0.2.0
pandas>=1.5.0
plotly>=5.0.0
```
