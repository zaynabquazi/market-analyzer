import { useState } from 'react'
import SearchBar from './components/SearchBar'
import MetricCards from './components/MetricCards'
import SignalBanner from './components/SignalBanner'
import PriceChart from './components/PriceChart'
import RsiChart from './components/RsiChart'
import MlPrediction from './components/MlPrediction'

const BASE = import.meta.env.VITE_API_URL ?? ''
const analyzeUrl = (ticker, period) => `${BASE}/analyze/${ticker}?period=${period}`

export default function App() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [period, setPeriod]   = useState('3mo')

  async function handleSearch(ticker) {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(analyzeUrl(ticker, period))
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to fetch data')
      }
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-8 sm:py-10 max-w-5xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">🔥 Market Analyzer Monkey</h1>
        <p className="text-gray-400 text-sm">Real-time technical analysis for stocks &amp; crypto — Zaynab Muzaffar Quazi</p>
      </header>

      <SearchBar onSearch={handleSearch} period={period} onPeriodChange={setPeriod} />

      {loading && (
        <div className="mt-16 flex justify-center">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="mt-8 bg-down/10 border border-down/30 text-down rounded-xl px-5 py-4">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-8 space-y-6">
          <MetricCards data={data} />
          <SignalBanner data={data} />
          <PriceChart candles={data.candles} />
          <RsiChart candles={data.candles} />
          <MlPrediction ticker={data.ticker} />
        </div>
      )}
      <footer className="mt-16 text-center text-gray-600 text-sm">
        Built by Zaynab Muzaffar Quazi
      </footer>
    </div>
  )
}
