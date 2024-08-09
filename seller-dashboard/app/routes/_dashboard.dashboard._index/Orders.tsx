import { Link } from "@remix-run/react";
import moment from "moment";
import { ArrowRight, Package } from "react-feather";
import { formatNumber } from "~/utils/ui";
import RenderStatusTableData from "../invoice.$id._index/RenderStatusTableData";
import { OrderStatus } from "@prisma/client";

export default function Orders(props: {
  data: {
    orders: {
      id: string
      status: OrderStatus
      total: number
      createdAt: Date | string
    }[]
    newOrdersTodayCount: number
    pendingOrdersCount: number
    completedOrdersCount: number
  }
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap">
        <div className="flex items-center gap-4">
          <Package />
          <p>Orders</p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <span className="badge badge-warning">Pending {formatNumber(props.data.pendingOrdersCount)}</span>
          <span className="badge badge-secondary">Completed {formatNumber(props.data.completedOrdersCount)}</span>
          <span className="badge badge-success">New Today {formatNumber(props.data.newOrdersTodayCount)}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead><tr>
            <th>Status</th>
            <th>Amount</th>
            <th>Ordered At</th>
            <th></th>
          </tr></thead>
          <tbody>
            {props.data.orders.map(r => (
              <tr key={r.id}>
                <RenderStatusTableData status={r.status} />
                <td>Rs. {formatNumber(r.total)}</td>
                <td>{moment(r.createdAt).fromNow()}</td>
                <td>
                  <Link className="btn btn-sm btn-primary" to={`/order/${r.id}`}>View</Link>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={4}>
                <Link to='/order' className="btn btn-primary inline-block w-full flex items-center">
                  <span>View all orders</span> <ArrowRight />
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
