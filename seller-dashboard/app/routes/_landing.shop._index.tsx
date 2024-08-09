import type { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import Logo from '~/components/Logo'


export const meta: MetaFunction = () => {
  return [
    { title: 'Personal branded selling platform | Preebee' },
    { name: 'description', content: `Create your own place in the internet and make it easier for customers to purchase from you.` },
  ]
}

export default function Index() {
  return (
    <div className='space-y-24 mb-8'>
      <div className='min-h-[60vh] flex items-center items-start flex-col justify-center gap-8 max-w-xl mx-auto text-center'>
        <h1 className='text-5xl font-bold'>
          No more problems in selling now!
        </h1>
        <p>
          Make your life easier by opening your own shop and selling with full management.
        </p>
        <div className="flex items-center gap-2 relative">
          <Link to='/register' className='btn btn-primary'>Get Started</Link>
          <span className='absolute -right-3/4 mb-4 block -rotate-12'>For free!</span>
        </div>
      </div>


      <div className="grid gap-16 bg-base-200 p-8 rounded-lg xl:p-0 xl:bg-white xl:rounded-none xl:grid-cols-2 w-full items-center">
        <div>
          <h1 className='text-2xl font-bold'>
            No more talking for <span className='bg-error text-white px-2'>hours</span> just to sell one product.
          </h1>
          <p className='mt-8'>
            With Preebee, your customer can open your shop whenever they want to place an order. No need to talk or wait, both for customer and seller.
          </p>
        </div>
        <div>
          <img loading='lazy' className='max-h-[70vh] mx-auto' src='/images/landing/whatsapp_chat.png' />
        </div>
      </div>
      <div>
        <h1 className="text-2xl mb-8 font-bold text-center">Your shop, your solution.</h1>
        <p className='text-center'>Preebee will help you create shop that is open 24/7.</p>
        <div className="flex items-center justify-around flex-col xl:flex-row my-8">
          <div className="flex items-center justify-center gap-2 my-4">
            <p className="text-lg font-semibold">Customer</p>
            <ul className="steps">
              <li className="step">Open shop</li>
              <li className="step">Select Product</li>
              <li className="step">Checkout</li>
            </ul>
          </div>
          <div className="flex items-center justify-center gap-2 my-4">
            <p className="text-lg font-semibold">Seller (You)</p>
            <ul className="steps">
              <li className="step">Open Order</li>
              <li className="step">Ship Product</li>
              <li className="step">Recieve Payment</li>
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Link to='/register' className="btn btn-primary">Open your shop now</Link>
        </div>
      </div>
      <div className="grid bg-base-200 p-8 rounded-lg xl:p-0 xl:bg-white xl:rounded-none xl:grid-cols-2 w-full items-center gap-16">
        <div>
          <div className="mockup-browser border border-base-300 w-[70vw] mx-auto md:w-full">
            <div className="mockup-browser-toolbar">
              <div className="input border border-base-300">acme.preebee.com</div>
            </div>
            <img loading='lazy' src='/images/landing/page.png' className='max-h-[70vh] mx-auto' />
          </div>
        </div>
        <div>
          <h1 className='text-2xl font-bold'>
            Your unique identity
          </h1>
          <p className='mt-8'>
            You will have unique website for your shop which your customers can visit to purchase your products.
          </p>
        </div>
      </div>
      <div className="grid bg-base-200 p-8 rounded-lg xl:p-0 xl:bg-white xl:rounded-none xl:grid-cols-2 w-full items-center gap-16">
        <div>
          <img loading='lazy' className='max-h-[70vh] mx-auto' src='/images/landing/facebook_post.png' />
        </div>
        <div>
          <h1 className='text-2xl font-bold'>
            Easily <span className="text-white px-2 bg-green-600">share</span> your products when doing live show on <span className="text-white px-2 bg-blue-600">Facebook</span>.
          </h1>
          <p className='mt-8'>
            You can either share your shop website or product link when doing live show. Customers can open to order. No need to talk! No missed customers!
          </p>
        </div>
      </div>
      <h1 className="text-2xl mb-8 font-bold text-center">Full Management, at your fingertips.</h1>

      <div className="grid bg-base-200 p-8 rounded-lg xl:p-0 xl:bg-white xl:rounded-none xl:grid-cols-2 w-full items-center gap-16">
        <div>
          <img loading='lazy' className='max-h-[70vh] mx-auto' src='/images/landing/dashboard.png' />
        </div>
        <div>
          <h1 className='text-2xl font-bold'>
            Get full information.
          </h1>
          <p className='mt-8'>
            Full insights of how your products are being sold. Charts for your revenue.
          </p>
        </div>
      </div>

      <div className="grid bg-base-200 p-8 rounded-lg xl:p-0 xl:bg-white xl:rounded-none xl:grid-cols-2 w-full items-center gap-16">
        <div>
          <img loading='lazy' className='max-h-[70vh] mx-auto' src='/images/landing/customers.png' />
        </div>
        <div>
          <h1 className='text-2xl font-bold'>
            Customers
          </h1>
          <p className='mt-8'>
            Know your customers. Get full information about them whenever you want. Use it for marketing.
          </p>
        </div>
      </div>

      <div className="grid bg-base-200 p-8 rounded-lg xl:p-0 xl:bg-white xl:rounded-none xl:grid-cols-2 w-full items-center gap-16">
        <div>
          <img loading='lazy' className='max-h-[70vh] mx-auto' src='/images/landing/order.png' />
        </div>
        <div>
          <h1 className='text-2xl font-bold'>
            Orders
          </h1>
          <p className='mt-8'>
            Manage your orders efficiently.
          </p>
        </div>
      </div>

      <div className="grid bg-base-200 p-8 rounded-lg xl:p-0 xl:bg-white xl:rounded-none xl:grid-cols-2 w-full items-center gap-16">
        <div>
          <img loading='lazy' className='max-h-[70vh] mx-auto' src='/images/landing/customize.png' />
        </div>
        <div>
          <h1 className='text-2xl font-bold'>
            Customize
          </h1>
          <p className='mt-8'>
            Full customization of your shop to truly match your shop.
          </p>
        </div>
      </div>

        <div className="flex items-center justify-center">
          <Link to='/register' className="btn btn-primary">Open your shop now</Link>
        </div>

      <footer className="footer footer-center p-10 bg-primary text-primary-content rounded-xl">
        <div>
          <Logo />
          <p className="font-bold">
            Preebee. <br />Providing reliable tech since 2024
          </p>
          <p>Copyright © 2024 - All right reserved</p>
        </div>
        <div>
          <div className="grid grid-flow-col gap-4">
            <a href='https://x.com/preebee' target='_blank'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a>
            <a href='https://youtube.com/preebee' target='_blank'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></a>
            <a href='https://facebook.com/preebee' target='_blank'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg></a>
          </div>
        </div>
      </footer>

    </div>
  )
}
