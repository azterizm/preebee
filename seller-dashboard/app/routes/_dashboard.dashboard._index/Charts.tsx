import classNames from 'classnames';
import moment from 'moment';
import { useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { formatNumberCompact } from '~/utils/ui';
import { YEARS_DATA_RANGE } from './constants';
import { ActiveIncomeTime, activeIncomeTimeKeys } from './types';
import useSWR from 'swr';

export default function Charts(props: {
  shopName: string
  refresh?: boolean
}) {
  const [activeTime, setActiveTime] = useState<ActiveIncomeTime>(ActiveIncomeTime.Month)
  const { data, isLoading } = useSWR<{ [x: string]: number }>(`/api/dashboard/income/${activeTime === ActiveIncomeTime.Month ? 'mon' : activeIncomeTimeKeys[activeTime].toLowerCase()}?shopName=${props.shopName}${props.refresh ? '&time=' + (new Date().getTime()) : ''}`)
  const [{ color, months, currentDate }] = useState(() => ({
    color: getComputedStyle(document.querySelector(':root')!).getPropertyValue('--p'),
    months: moment.monthsShort(),
    currentDate: new Date()
  }))

  const dataRows = activeTime === ActiveIncomeTime.Day ? new Array(moment().daysInMonth()).fill(null).map((_, i) => (i + 1).toString()) :
    activeTime === ActiveIncomeTime.Month ? months : new Array(YEARS_DATA_RANGE).fill(null).map((_, i) => currentDate.getFullYear() - i).reverse()

  function handleNaN(arg: any) {
    const result = Number(arg)
    if (isNaN(result)) return 0
    return result
  }

  return (
    <div className='p-8 shadow-lg rounded-box'>
      <div className="flex-col sm:flex-row flex items-start sm:items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Income Statistics</h1>
          <p className="text-5xl font-semibold mt-4">
            Rs. {formatNumberCompact(!data ? 0 : handleNaN(data[activeTime === ActiveIncomeTime.Month ? currentDate.getMonth() : activeTime === ActiveIncomeTime.Day ? currentDate.getDate() : currentDate.getFullYear()]) || 0, { minimumFractionDigits: 2 })}
          </p>
          <p className="font-medium text-sm mt-2 text-neutral-400">Total income this {activeIncomeTimeKeys[activeTime].toLowerCase()}</p>
        </div>
        <div className="join mt-4 sm:mt-0">
          {activeIncomeTimeKeys.map((r, i) => (
            <button
              key={i}
              className={classNames('btn btn-outline btn-primary join-item', { 'btn-active': activeTime === i })}
              onClick={() => setActiveTime(i)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div style={{ height: 400, marginTop: 20 }} className="skeleton w-full" />
      ) : !data ? null : (
        <ResponsiveContainer width='100%' height={400}>
          <LineChart data={dataRows.map((r, i) => ({ name: String(r), earnings: handleNaN(data[activeTime === ActiveIncomeTime.Month ? i : Number(r)]) }))} margin={{ left: 20, top: 20 }} >
            <Tooltip formatter={(v) => `Rs. ${Math.floor(Number(v))}`} />
            <XAxis dataKey='name' />
            <Line type='monotone' dataKey="earnings" stroke={`oklch(${color})`} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}


