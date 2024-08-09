import { formatNumber, formatNumberCompact } from "~/utils/ui";

export default function Stats(props: {
  income: number,
  customers: number,
  sales: number,
  views: number
}) {
  return (
    <div className="stats stats-vertical sm:stats-horizontal shadow w-full">
      <div className="stat">
        <div className="stat-title">Income</div>
        <div className="stat-value">Rs. {formatNumberCompact(props.income)}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Customers</div>
        <div className="stat-value">{formatNumber(props.customers)}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Sales</div>
        <div className="stat-value">{formatNumber(props.sales)}</div>
      </div>
      <div className="stat">
        <div className="stat-title">Total Page Views</div>
        <div className="stat-value">{formatNumber(props.views)}</div>
      </div>
    </div>
  )
}
