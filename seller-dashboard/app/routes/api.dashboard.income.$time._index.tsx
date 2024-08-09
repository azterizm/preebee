import { LoaderFunctionArgs, json } from "@remix-run/node";
import toTime from 'to-time'
import _ from "lodash";
import moment from "moment";
import { prisma } from "~/db.server";
import { requireSellerWithShop } from "~/session.server";
import { YEARS_DATA_RANGE } from "./_dashboard.dashboard._index/constants";

//Take aggregate past years, and months
export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireSellerWithShop(request)
  const time = (params.time || 'mon') as 'mon' | 'day' | 'year'

  const startDate = time === 'mon' ? moment().month(0).hour(0).minute(0).toDate() :
    time === 'year' ? moment().subtract(YEARS_DATA_RANGE, 'year').month(0).hour(0).minute(0).toDate() :
      moment().date(0).hour(0).minute(0).toDate()

  const orderInstances = await prisma.order.findMany({
    where: {
      updatedAt: {
        gte: startDate
      },
      shopId: user.shop.id,
      status: 'COMPLETED'
    },
    select: {
      total: true,
      updatedAt: true
    }
  })

  return json(
    prepareResult(
      orderInstances,
      e => new Date(e.updatedAt)[
        time === 'mon' ? 'getMonth' :
          time === 'year' ? 'getFullYear' :
            'getDate'
      ]()
    ),
    { headers: { 'cache-control': `max-age=${toTime('1h').seconds()}, stale-while-revalidate=${toTime('30m').seconds()}, private` } }
  )
}

function prepareResult<T extends { total: number, updatedAt: Date | string }>(data: T[], iteratee: _.ValueIteratee<T>) {
  const byIteratee = _.groupBy(data, iteratee)
  const result: { [key: string]: number } = {}
  for (const key in byIteratee) {
    const aggregate = byIteratee[key].map(r => r.total).reduce((a, c) => a + c, 0)
    result[key] = aggregate
  }
  return result
}
