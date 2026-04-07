// In development, Vite proxies /analyze and /predict to localhost:8000
// In production (Vercel), requests go directly to the Render backend
const BASE = import.meta.env.VITE_API_URL ?? ''

export const analyzeUrl = (ticker, period) => `${BASE}/analyze/${ticker}?period=${period}`
export const predictUrl = (ticker) => `${BASE}/predict/${ticker}`
