import { useGSAP } from '@gsap/react'
import { json, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import classNames from 'classnames'
import gsap from 'gsap'
import { useRef, useState } from 'react'
import { ArrowUpRight } from 'react-feather'
import { authenticator } from '~/auth.server'
import Logo from '~/components/Logo'
import NavbarManageButtons from '~/components/NavbarManageButtons'
import { navData } from '~/constants/ui'
import { prisma } from '~/db.server'
import { formatNumberCompact } from '~/utils/ui'
import MenuItem from './MenuItem'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  })
  const shop = await prisma.shop.findFirst({
    where: {
      seller: { id: user.id },
    },
  })

  if (!shop) return redirect('/onboard')
  const newOrdersCount = await prisma.order.count({
    where: { shopId: shop.id, checked: false },
  })
  return json({ newOrdersCount, user, shopName: shop.name })
}

export default function DashboardContainer() {
  const data = useLoaderData<typeof loader>()
  const containerRef = useRef<HTMLDivElement>(null)
  const { contextSafe } = useGSAP({ scope: containerRef })
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleMenu = contextSafe(() => {
    const width = window.innerWidth
    if (width > 1268) return
    gsap.to('#header_menu', {
      x: (!menuOpen ? 0 : -100) + '%'
    })
    gsap.to('#fade', {
      opacity: !menuOpen ? 1 : 0
    })
    setMenuOpen(e => !e)
  })
  return (
    <div ref={containerRef} className='flex px-4 py-8 space-x-8'>
      <div id='header_menu' className='fixed pb-8 xl:sticky bg-base-300 xl:bg-white h-screen top-0 left-0 px-4 z-50 overflow-y-visible overflow-x-visible -translate-x-full xl:translate-x-0 pt-4 xl:pt-0 xl:pb-0'>
        <Logo className='text-center mb-4 pt-2 max-w-[14rem]' />
        <ul className='menu xl:bg-base-300 w-max min-w-56 rounded-box xl:[&>li>a]:py-3 [&>li>a]:py-6'>
          {navData.map((r, i) =>
            typeof r.to === 'string' ?
              <MenuItem
                badge={r.label === 'Orders' && data.newOrdersCount > 0 ? `+${formatNumberCompact(data.newOrdersCount)}` : null}
                key={i}
                to={r.to}
                label={r.label}
                icon={r.icon}
              />
              : (
                <li key={r.label}>
                  <details>
                    <summary>{r.label}</summary>
                    <ul>
                      {r.to.map((sub) => (
                        <MenuItem
                          key={sub.label}
                          to={sub.to}
                          label={sub.label}
                          icon={sub.icon}
                        />
                      ))}
                    </ul>
                  </details>
                </li>
              )
          )}
        </ul>
        <Link
          target='_blank'
          to={`https://${data.shopName}.preebee.com/p`}
          className='p-[3px] relative w-full mt-4 block text-center truncate w-full max-w-56 hover:max-w-fit hover:w-fit hover:absolute hover:z-50'
        >
          <div className='absolute inset-0 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-lg' />
          <div className='gap-1 flex items-center justify-center px-8 py-2 truncate bg-white rounded-[6px] relative group transition duration-200 text-black hover:bg-transparent'>
            <span className='truncate'>
              {data.shopName}.preebee.com
            </span>{' '}
            <ArrowUpRight size={16} />
          </div>
        </Link>
      </div>

      <div className='flex-1 !m-0 xl:!ml-[2rem]'>
        <NavbarManageButtons
          isOpen={menuOpen}
          onToggleMenu={toggleMenu}
          user={data.user}
          className='mb-4'
        />
        <div className={classNames('min-h-[80vh]')}>
          <Outlet />
        </div>
        <footer className="footer items-center p-4 mt-12">
          <aside className="items-center grid-flow-col">
            <Logo />
            <Link to='mailto:contact@preebee.com' className="btn btn-ghost">Contact</Link>
          </aside>
          <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
            <a href='https://x.com/preebee' target='_blank'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a>
            <a href='https://youtube.com/preebee' target='_blank'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></a>
            <a href='https://facebook.com/preebee' target='_blank'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg></a>
          </nav>
        </footer>
      </div>
      <div id='fade' className="xl:hidden z-10 fixed top-0 left-0 bg-black/50 pointer-events-none w-screen h-screen !m-0 opacity-0" />
    </div>
  )
}
