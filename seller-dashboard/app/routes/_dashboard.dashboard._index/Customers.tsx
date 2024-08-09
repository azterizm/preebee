import { Link } from "@remix-run/react";
import { ArrowRight, User } from "react-feather";

export default function Customers(props: {
  data: {
    customersCount: number;
    topCustomers: {
      id?: string | undefined;
      province?: string | undefined;
      city?: string | undefined;
      name: string;
      orders: number;
    }[];
  }
}) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <User />
        <p>Top Customers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead><tr>
            <th>Name</th>
            <th>Orders</th>
            <th>Location</th>
            <th></th>
          </tr></thead>
          <tbody>
            {props.data.topCustomers.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.orders}</td>
                <td>{r.province}, {r.city}</td>
                <td>
                  <Link className="btn btn-sm btn-primary" to={`/customers/${r.id}`}>View</Link>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={4}>
                <Link to='/customers' className="btn btn-primary inline-block w-full flex items-center">
                  <span>View all customers</span> <ArrowRight />
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
