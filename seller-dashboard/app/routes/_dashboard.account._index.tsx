import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { serialize } from "object-to-formdata"
import { useRef } from "react"
import LogoutButton from "~/components/LogoutButton"
import { prisma } from "~/db.server"
import { getSession, requireSellerWithShop, sessionStorage } from "~/session.server"
import { convertFormToJSON } from "~/utils/api"
import { resetOnboardData } from "./onboard/handle.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const seller = await requireSellerWithShop(request)
  return json({ user: seller })
}

export default function Account() {
  const data = useLoaderData<typeof loader>()
  const deleteModalRef = useRef<HTMLDialogElement>(null)
  const fetcher = useFetcher()

  function onConfirm() {
    fetcher.submit(serialize({ action: 'delete' }), { method: 'post' })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Account Information</h1>

      <div className="flex gap-4 my-4 text-lg">
        <div className="flex flex-col items-start font-semibold">
          <p>Name</p>
          <p>Email</p>
          <p>Shop name</p>
        </div>
        <div className="flex flex-col items-start">
          <p>{data.user.name}</p>
          <p>{data.user.email}</p>
          <p>{data.user.shop.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LogoutButton disabled={fetcher.state !== 'idle'} />
        <button disabled={fetcher.state !== 'idle'} onClick={() => deleteModalRef.current?.showModal()} className="btn btn-outline btn-sm btn-error">Delete my account</button>
      </div>

      <dialog ref={deleteModalRef} id="delete_modal" className="modal modal-bottom sm:modal-middle">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Delete my account</h3>
          <p className="py-4">Are you sure that you want to <span className="badge badge-error">remove</span> your account? This action <span className="badge badge-error">cannot be undone</span> so please confirm.</p>
          <div className="modal-action">
            <button disabled={fetcher.state !== 'idle'} onClick={onConfirm} className="btn btn-error">Confirm</button>
            <button disabled={fetcher.state !== 'idle'} onClick={() => deleteModalRef.current?.close()} className="btn">Close</button>
          </div>
        </form>
      </dialog>
    </div>
  )
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = convertFormToJSON(await request.formData())
  const seller = await requireSellerWithShop(request)

  if (body.action === 'delete') {
    await resetOnboardData(seller.id)
    await prisma.shop.deleteMany({ where: { seller: { id: seller.id } } })
    await prisma.seller.delete({ where: { id: seller.id } })
    const session = await getSession(request.headers.get('Cookie'))
    return redirect('/', {
      headers: {
        'Set-Cookie': await sessionStorage.destroySession(session),
      },
    })
  }

  return null
}


export const meta = () => {
  return [
    { title: 'Account | Preebee' },
  ]
}
