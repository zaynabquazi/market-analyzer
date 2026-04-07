import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

function Card({ label, value, sub, subColor, icon: Icon, iconColor }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
      <div className={`p-2 rounded-xl ${iconColor}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
        {sub && <p className={`text-sm mt-0.5 ${subColor}`}>{sub}</p>}
      </div>
    </div>
  )
}

export default function MetricCards({ data }) {
  const priceDelta = (((data.price - data.ma20) / data.ma20) * 100).toFixed(2)
  const priceUp    = data.price >= data.ma20

  const rsiColor =
    data.rsi > 70 ? 'text-down' :
    data.rsi < 30 ? 'text-up'   : 'text-warn'

  const rsiLabel =
    data.rsi > 70 ? 'Overbought' :
    data.rsi < 30 ? 'Oversold'   : 'Neutral'

  const aboveMa200 = data.ma200 ? data.price >= data.ma200 : null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Current Price"
        value={`$${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        sub={`${priceUp ? '▲' : '▼'} ${Math.abs(priceDelta)}% vs MA20`}
        subColor={priceUp ? 'text-up' : 'text-down'}
        icon={priceUp ? TrendingUp : TrendingDown}
        iconColor={priceUp ? 'bg-up/20' : 'bg-down/20'}
      />
      <Card
        label="MA (20)"
        value={`$${data.ma20.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        sub={data.trend}
        subColor={priceUp ? 'text-up' : 'text-down'}
        icon={Activity}
        iconColor="bg-accent/20"
      />
      <Card
        label="MA (200)"
        value={data.ma200 ? `$${data.ma200.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
        sub={aboveMa200 !== null ? (aboveMa200 ? 'Price above MA200' : 'Price below MA200') : 'Insufficient data'}
        subColor={aboveMa200 ? 'text-up' : 'text-down'}
        icon={aboveMa200 ? TrendingUp : TrendingDown}
        iconColor={aboveMa200 ? 'bg-up/20' : 'bg-down/20'}
      />
      <Card
        label="RSI (14)"
        value={data.rsi.toFixed(1)}
        sub={rsiLabel}
        subColor={rsiColor}
        icon={Activity}
        iconColor={data.rsi > 70 ? 'bg-down/20' : data.rsi < 30 ? 'bg-up/20' : 'bg-warn/20'}
      />
    </div>
  )
}
