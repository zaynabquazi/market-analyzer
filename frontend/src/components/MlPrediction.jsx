import { useState } from 'react'
import { BrainCircuit, TrendingUp, TrendingDown, Loader } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL ?? ''
const predictUrl = (ticker) => `${BASE}/predict/${ticker}`

export default function MlPrediction({ ticker }) {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function run() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(predictUrl(ticker))
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.detail || 'Prediction failed')
      }
      setResult(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const confidenceColor = {
    high:     'text-up',
    moderate: 'text-warn',
    low:      'text-gray-400',
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-accent shrink-0" />
          <div>
            <p className="text-white font-semibold">ML Prediction</p>
            <p className="text-xs text-gray-500">Random Forest · trained on 5y of data</p>
          </div>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition w-full sm:w-auto"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : '🤖 Run Prediction'}
        </button>
      </div>

      {error && (
        <p className="text-down text-sm">{error}</p>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-gray-400 text-sm py-4">
          <Loader className="w-4 h-4 animate-spin" />
          Training model on historical data…
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* main signal */}
          <div className={`border-l-4 rounded-xl px-5 py-4 ${result.direction === 'up' ? 'border-up/50 bg-up/5' : 'border-down/50 bg-down/5'}`}>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Signal</p>
            <p className="text-white text-lg font-medium">"{result.signal}"</p>
          </div>

          {/* probability bars */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-up" />
                <span className="text-gray-400 text-xs uppercase tracking-widest">Chance Up</span>
              </div>
              <p className="text-up text-3xl font-bold">{result.prob_up}%</p>
              <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-up rounded-full" style={{ width: `${result.prob_up}%` }} />
              </div>
            </div>
            <div className="bg-surface rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-down" />
                <span className="text-gray-400 text-xs uppercase tracking-widest">Chance Down</span>
              </div>
              <p className="text-down text-3xl font-bold">{result.prob_down}%</p>
              <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-down rounded-full" style={{ width: `${result.prob_down}%` }} />
              </div>
            </div>
          </div>

          {/* confidence + top features */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-surface rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-gray-400 text-xs uppercase tracking-widest">Confidence</span>
              <span className={`font-semibold capitalize ${confidenceColor[result.confidence]}`}>{result.confidence}</span>
            </div>
            <div className="bg-surface rounded-xl px-4 py-3 flex-1">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Top Signals Used</p>
              <div className="flex flex-wrap gap-2">
                {result.top_features.map(f => (
                  <span key={f.name} className="text-xs bg-border text-gray-300 px-2 py-1 rounded-lg">
                    {f.name} <span className="text-accent">{f.importance}%</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-xs">⚠️ For educational purposes only. Not financial advice.</p>
        </div>
      )}
    </div>
  )
}
