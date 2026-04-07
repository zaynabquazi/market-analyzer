import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'

function CandleBar(props) {
  const { x, y, width, payload } = props
  if (!payload) return null
  const { open, close, high, low } = payload
  const isUp    = close >= open
  const color   = isUp ? '#2ecc71' : '#e94560'
  const bodyTop = Math.min(open, close)
  const bodyH   = Math.abs(close - open) || 1
  const scale   = props.height / (props.domain[1] - props.domain[0])
  const domainMin = props.domain[0]

  const toY = v => props.background.y + props.background.height - (v - domainMin) * scale

  return (
    <g>
      {/* wick */}
      <line x1={x + width / 2} x2={x + width / 2}
            y1={toY(high)} y2={toY(low)}
            stroke={color} strokeWidth={1} />
      {/* body */}
      <rect x={x + 1} y={toY(Math.max(open, close))}
            width={Math.max(width - 2, 1)}
            height={Math.max(Math.abs(toY(open) - toY(close)), 1)}
            fill={color} />
    </g>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-3 text-xs text-white space-y-1">
      <p className="text-gray-400 mb-1">{label}</p>
      <p>O: <span className="text-white">${d.open}</span></p>
      <p>H: <span className="text-up">${d.high}</span></p>
      <p>L: <span className="text-down">${d.low}</span></p>
      <p>C: <span className="text-white">${d.close}</span></p>
      {d.ma20  && <p>MA20:  <span className="text-yellow-400">${d.ma20}</span></p>}
      {d.ma200 && <p>MA200: <span className="text-blue-400">${d.ma200}</span></p>}
    </div>
  )
}

export default function PriceChart({ candles }) {
  // thin out labels for readability
  const tickInterval = Math.floor(candles.length / 6)

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">Price &amp; MA(20)</p>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={candles} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }}
                 interval={tickInterval} tickLine={false} axisLine={false} />
          <YAxis domain={['auto', 'auto']} tick={{ fill: '#6b7280', fontSize: 11 }}
                 tickLine={false} axisLine={false} width={70}
                 tickFormatter={v => `$${v.toLocaleString()}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
          <Bar dataKey="close" name="Price" fill="#6c63ff" opacity={0.15} />
          <Line dataKey="ma20" name="MA(20)" stroke="#f5a623"
                dot={false} strokeWidth={2} connectNulls />
          <Line dataKey="ma200" name="MA(200)" stroke="#60a5fa"
                dot={false} strokeWidth={2} connectNulls strokeDasharray="5 3" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
