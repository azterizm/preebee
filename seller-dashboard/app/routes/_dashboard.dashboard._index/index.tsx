import { LoaderFunctionArgs, defer, redirect } from "@remix-run/node";
import { Await, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import { redis } from "~/db.server";
import { requireSeller } from "~/session.server";
import Charts from "./Charts";
import Customers from "./Customers";
import Orders from "./Orders";
import Provinces from "./Provinces";
import Stats from "./Stats";
import { getCustomersInfo, getIncomeInfo, getOrdersInfo, getTopProducts, getTopProvinces, isSellerNew } from "./fetch.server";
import { Suspense, useEffect, useRef } from "react";
import classNames from "classnames";
import Products from "./Products";
import _ from "lodash";

export const meta = () => {
  return [
    { title: 'Dashboard | Preebee' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const seller = await requireSeller(request)
  if (!seller.shop) return redirect('/onboard')

  const ordersInfo = getOrdersInfo(seller.shop.id)
  const pageViewsByDate = await redis.hgetall(`views:${seller.shop.name}`)
  const topProducts = getTopProducts(seller.shop.id)
  const customers = await getCustomersInfo(seller.shop.id)
  const topProvinces = getTopProvinces(seller.shop.id)
  const income = await getIncomeInfo(seller.shop.id)

  const isNew = await isSellerNew(seller.shop.id)

  return defer({
    ordersInfo,
    pageViewsByDate,
    topProducts,
    customers,
    topProvinces,
    income,
    shop: seller.shop,
    isNew,
  }, {
    headers: {
      'Set-Cookie': 'message=; Path=/; Max-Age=0',
    },
  })
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>()
  const newSellerModalRef = useRef<HTMLDialogElement>(null)
  const navigation = useNavigation()

  useEffect(() => {
    if (data.isNew && newSellerModalRef?.current) {
      _.delay(() => {
        newSellerModalRef?.current?.showModal()
      }, 1500)
    }
  }, [])

  return (
    <div>
      <Stats
        income={data.income.total}
        customers={data.customers.customersCount}
        sales={data.income.sales}
        views={Object.values(data.pageViewsByDate).map(Number).reduce((a, c) => a + c, 0)}
      />

      <ClientOnly fallback={<div className="skeleton w-full my-8" style={{ height: 400 }} />}>
        {() => <Charts shopName={data.shop.name} />}
      </ClientOnly>

      <div className="mt-4 [&>div]:shadow-lg [&>div]:p-4 [&>div]:rounded-box gap-4 grid grid-cols-1 2xl:grid-cols-2">
        <Suspense fallback={<div className="skeleton min-w-[28rem] min-h-56" />}>
          <Await resolve={data.ordersInfo}>
            {(data) => <Orders data={data} />}
          </Await>
        </Suspense>
        <Customers data={data.customers} />
        <Suspense fallback={<div className="skeleton" />}>
          <Await resolve={data.topProducts}>
            {data => <Products data={data} />}
          </Await>
        </Suspense>
        <Suspense fallback={<div className="skeleton" />}>
          <Await resolve={data.topProvinces}>
            {data => <Provinces data={data} />}
          </Await>
        </Suspense>
      </div>

      <dialog ref={newSellerModalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Welcome!</h3>
          <p className="py-4">
            This is your fresh start of{' '}
            <Link to='/' className="link link-primary">Preebee</Link>
            . You have just finished setup of your{' '}
            <Link className="link link-primary" target='_blank' to={`https://${data.shop.name}.preebee.com`}>shop</Link>
            . Now it's time to add your first product in it.
          </p>
          <div className="modal-action">
            <button disabled={navigation.state !== 'idle'} onClick={() => newSellerModalRef.current?.close()} className="btn btn-ghost">Close</button>
            <Link to='/products/manage' className={classNames('btn btn-primary', { 'btn-disabled': navigation.state !== 'idle' })}>Add Product</Link>
          </div>
        </div>
      </dialog>
    </div>
  )
}


