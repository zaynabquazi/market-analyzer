import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ReferenceArea
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-3 text-xs text-white">
      <p className="text-gray-400 mb-1">{label}</p>
      <p>RSI: <span className="text-purple-400">{payload[0]?.value?.toFixed(1)}</span></p>
    </div>
  )
}

export default function RsiChart({ candles }) {
  const tickInterval = Math.floor(candles.length / 6)

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">RSI (14)</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={candles} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }}
                 interval={tickInterval} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }}
                 tickLine={false} axisLine={false} width={30} />
          <Tooltip content={<CustomTooltip />} />

          {/* overbought zone */}
          <ReferenceArea y1={70} y2={100} fill="#e94560" fillOpacity={0.08} />
          {/* oversold zone */}
          <ReferenceArea y1={0}  y2={30}  fill="#2ecc71" fillOpacity={0.08} />

          <ReferenceLine y={70} stroke="#e94560" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={30} stroke="#2ecc71" strokeDasharray="4 4" strokeWidth={1} />

          <Line dataKey="rsi" name="RSI" stroke="#a29bfe"
                dot={false} strokeWidth={2} connectNulls />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-6 mt-3 text-xs text-gray-500">
        <span><span className="text-down">■</span> Overbought (&gt;70)</span>
        <span><span className="text-up">■</span> Oversold (&lt;30)</span>
      </div>
    </div>
  )
}
