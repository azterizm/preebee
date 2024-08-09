import { Globe } from "react-feather";

export default function Provinces(props: {
  data: {
    province: string,
    _count: { province: number }
  }[]
}) {
  if (!props.data.length) return null

  const max = props.data.map(r => r._count.province).reduce((a, c) => a > c ? a : c, 0)
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Globe />
        <p>Top Provinces</p>
      </div>
      {props.data.map(r => (
        <div key={r.province} className="flex items-center gap-4">
          <p className="text-neutral">{r.province}</p>
          <progress className="progress progress-primary flex-1" value={Math.floor(r._count.province / max * 100)} max={Math.floor(max)} />
        </div>
      ))}
    </div>
  )
}
