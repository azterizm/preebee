import { Link } from "@remix-run/react";
import { ArrowRight, ShoppingBag } from "react-feather";
import { formatNumber } from "~/utils/ui";

export default function Products(props: {
  data: {
    count: number | null;
    product: {
      id: string;
      title: string;
      price: number;
      stockAvailable: number;
    } | null;
  }[]
}) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <ShoppingBag />
        <p>Top Products</p>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead><tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Orders</th>
            <th></th>
          </tr></thead>
          <tbody>
            {props.data.map(r => !r.count || !r.product ? null : (
              <tr key={r.product.id}>
                <td>{r.product.title}</td>
                <td>Rs. {formatNumber(r.product.price)}</td>
                <td>{formatNumber(r.product.stockAvailable)}</td>
                <td>{formatNumber(r.count)}</td>
                <td>
                  <Link className="btn btn-sm btn-primary" to={`/products/manage/${r.product.id}`}>View</Link>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={6}>
                <Link to='/products' className="btn btn-primary inline-block w-full flex items-center">
                  <span>View all products</span> <ArrowRight />
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
