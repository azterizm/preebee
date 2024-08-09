
import { LoaderFunctionArgs, json } from "@remix-run/node"
import { useLoaderData, useSearchParams } from "@remix-run/react"
import { useDeferredValue, useEffect, useState } from "react"
import SearchInput from "~/components/SearchInput"
import { prisma } from "~/db.server"
import { requireSellerWithShop } from "~/session.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const user = await requireSellerWithShop(request)
  const search = url.searchParams.get('search')

  const customers = await prisma.deliveryInfo.findMany({
    where: {
      orders: { some: { shopId: user.shop.id } },
      ...!search ? {} : {
        OR: [
          { name: { contains: search } },
          { city: { contains: search } },
          { phone: { contains: search } },
          { address: { contains: search } },
          { province: { contains: search } },
        ]
      }
    },
    distinct: 'name',
    select: {
      id: true,
      name: true,
      city: true,
      phone: true,
      address: true,
      province: true,
    },
    orderBy: { createdAt: 'desc' }
  })


  return json({
    customers,
  })
}

export default function Customers() {
  const data = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    setSearchParams({ search: deferredSearch })
  }, [deferredSearch, setSearchParams])

  return (
    <div>
      <div className="flex w-full mb-2 justify-between items-center flex-col xl:flex-row gap-y-4">
        <SearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Customer details"
          className="sm:min-w-[22rem]"
        />

      </div>
      <div className="overflow-x-auto max-w-[90vw]">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Province</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.customers.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.city}</td>
                <td>{r.phone}</td>
                <td>{r.address}</td>
                <td>{r.province}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const meta = () => {
  return [
    { title: 'Customers | Preebee' },
  ]
}
