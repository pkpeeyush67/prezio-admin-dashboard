type Props = {
  label: string
  value?: number
  helper: string
  tone: 'blue' | 'green' | 'amber' | 'violet'
  loading: boolean
}

export function KpiCard({ label, value, helper, tone, loading }: Props) {
  return (
    <article className={`kpi-card ${tone}`}>
      <div className="kpi-top">
        <span className="kpi-icon" aria-hidden="true" />
        <span className="kpi-label">{label}</span>
      </div>
      <strong>{loading ? '—' : (value ?? 0).toLocaleString()}</strong>
      <small>{helper}</small>
    </article>
  )
}
