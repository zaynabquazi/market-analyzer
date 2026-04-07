import { useState } from 'react'
import { Search } from 'lucide-react'

const PERIODS = ['1mo', '3mo', '6mo', '1y']

export default function SearchBar({ onSearch, period, onPeriodChange }) {
  const [ticker, setTicker] = useState('AAPL')

  function handleSubmit(e) {
    e.preventDefault()
    if (ticker.trim()) onSearch(ticker.trim().toUpperCase())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
        <input
          value={ticker}
          onChange={e => setTicker(e.target.value)}
          placeholder="AAPL, BTC, TSLA, ETH…"
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition"
        />
      </div>

      <div className="flex gap-2">
        {PERIODS.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onPeriodChange(p)}
            className={`px-4 py-3 rounded-xl text-sm font-medium border transition
              ${period === p
                ? 'bg-accent border-accent text-white'
                : 'bg-card border-border text-gray-400 hover:border-accent/50'}`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        type="submit"
        className="bg-accent hover:bg-accent/80 text-white font-semibold px-6 py-3 rounded-xl transition"
      >
        Analyze
      </button>
    </form>
  )
}
