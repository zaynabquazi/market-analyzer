const riskStyles = {
  'high risk':             'text-red-400 border-red-500/40 bg-red-500/5',
  'buying opportunity':    'text-green-400 border-green-500/40 bg-green-500/5',
  'moderate risk':         'text-yellow-400 border-yellow-500/40 bg-yellow-500/5',
}

export default function SignalBanner({ data }) {
  const style = riskStyles[data.risk] ?? riskStyles['moderate risk']

  return (
    <div className={`border-l-4 rounded-xl px-6 py-5 ${style}`}>
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Signal</p>
      <p className="text-lg font-medium text-white">
        "{data.ticker} is {data.trend} but{' '}
        <span className={style.split(' ')[0]}>{data.momentum}</span>
        {' '}→{' '}
        <span className={`font-bold ${style.split(' ')[0]}`}>{data.risk}</span>"
      </p>
    </div>
  )
}
