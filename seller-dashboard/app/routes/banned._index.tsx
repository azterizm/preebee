import { LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import Logo from "~/components/Logo"
import { getShopNameFromUrl } from "~/utils/api"
import { isShopBanned } from "~/utils/shop"

export async function loader({ request }: LoaderFunctionArgs) {
  const shopName = getShopNameFromUrl(request)
  if (!shopName) return redirect('/')
  const isBanned = await isShopBanned(shopName)
  if (!isBanned) return redirect('/')
  return json({ shopName })
}

export default function Banned() {
  const data = useLoaderData<typeof loader>()
  return (
    <div className="min-h-screen container flex flex-col py-4">
      <Link to='/'>
        <Logo />
      </Link>
      <div className="flex items-start justify-center flex-1 prose prose-lg text-left flex-col mx-auto">
        <h1>Shop has been banned.</h1>
        <p>The shop ({data.shopName}) you are trying to access has been banned by Preebee team. It was detected that this shop did not follow the rules. This shop may be accessible again after necessary actions has been taken by the owner of this shop.</p>
        <div className="flex items-center gap-4 not-prose">
          <Link to='/' className="btn btn-primary">Go Home</Link>
          <Link to='mailto:contact@preebee.com' className="btn btn-primary btn-outline">Contact Preebee</Link>
        </div>
      </div>

    </div>
  )
}
