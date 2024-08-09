import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useDebounce } from "@uidotdev/usehooks";
import { serialize } from "object-to-formdata";
import { useEffect, useState } from "react";
import PhoneNumberInput from "~/components/PhoneNumberInput";
import { prisma } from "~/db.server";
import { logout, requireSellerWithShop } from "~/session.server";
import { convertFormToJSON } from "~/utils/api";
import { submitSchema } from "./schema";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireSellerWithShop(request)
  const shop = await prisma.shop.findUnique({
    where: { id: user.shop.id },
  })
  if (!shop) throw logout(request)
  return json({ shop })
}

export default function Profile() {
  const data = useLoaderData<typeof loader>()
  const [input, setInput] = useState({
    phone: data.shop?.phone || '',
    address: data.shop?.address || '',
  })

  const inputDebounced = useDebounce(input, 1400)
  const fetcher = useFetcher()

  useEffect(() => {
    fetcher.submit(serialize(inputDebounced), { method: 'post' })
  }, [inputDebounced])

  function setInputValue(key: keyof typeof input, value: any) {
    setInput(v => ({ ...v, [key]: value }))
  }

  return (
    <div className="space-y-4">
      <p>Change your profile information from this page. Any change will be saved automatically. </p>
      <div className="form-control">
        <label className='label'>
          <span className='label-text'>Shop</span>
        </label>
        <div className="p-4 bg-base-300 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-lg">{data.shop.title}</p>
            <p className="text-sm">{data.shop.name}.preebee.com</p>
          </div>
          <Link to='change_shop' className="btn btn-primary">Change Website</Link>
        </div>
      </div>
      <div className="form-control">
        <label className='label'>
          <span className='label-text'>Address</span>
        </label>
        <textarea value={input.address} onChange={e => setInputValue('address', e.target.value)} name="address" id="address" className="textarea textarea-bordered" />
      </div>
      <PhoneNumberInput value={input.phone} onChange={e => setInputValue('phone', e)} />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireSellerWithShop(request)
  const form = await request.formData()
  const input = submitSchema.parse(convertFormToJSON(form))
  await prisma.shop.update({
    where: { id: user.shop.id },
    data: {
      phone: input.phone,
      address: input.address
    }
  })
  return null
}

export const meta = () => {
  return [
    { title: 'Profile | Preebee' },
  ]
}
