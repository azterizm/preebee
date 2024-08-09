import { json } from '@remix-run/node'
export const loader = async () => {
  return json(
    {
      "theme_color": "#491eff",
      "background_color": "#f2f2f2",
      "icons": [
        {
          "purpose": "maskable",
          "sizes": "512x512",
          "src": "/icon512_maskable.png",
          "type": "image/png"
        },
        {
          "purpose": "any",
          "sizes": "512x512",
          "src": "/icon512_rounded.png",
          "type": "image/png"
        }
      ],
      "orientation": "any",
      "display": "standalone",
      "dir": "auto",
      "lang": "en-US",
      "name": "Preebee",
      "short_name": "Preebee",
      "start_url": "/",
      "description": "Create your own place in the internet and make it easier for customers to purchase from you.",
      "id": "preebee",
      "categories": ["shopping", "social", "productivity"],
      "shortcuts": [
        {
          "name": "Dashboard",
          "url": "/dashboard",
          "icons": [{
            "sizes": "96x96",
            "src": "/icons/home.png",
            "type": "image/png"
          }]
        },
        {
          "name": "Add product",
          "url": "/products/manage",
          "icons": [{
            "sizes": "96x96",
            "src": "/icons/bag.png",
            "type": "image/png"
          }]
        },
        {
          "name": "Check orders",
          "url": "/order",
          "icons": [{
            "sizes": "96x96",
            "src": "/icons/cart.png",
            "type": "image/png"
          }]
        }
      ],
      "screenshots": [
        {
          "src": "/images/screenshots/page.png",
          "sizes": "1280x720",
          "type": "image/png",
          "form_factor": "wide",
          "label": "Shop page"
        },
        {
          "src": "/images/screenshots/order.png",
          "sizes": "1280x720",
          "type": "image/png",
          "form_factor": "wide",
          "label": "Order Management"
        },
        {
          "src": "/images/screenshots/dashboard.png",
          "sizes": "1280x720",
          "type": "image/png",
          "form_factor": "wide",
          "label": "Selling Analytics"
        },
        {
          "src": "/images/screenshots/customize.png",
          "sizes": "1280x720",
          "type": "image/png",
          "form_factor": "wide",
          "label": "Customize Shop"
        },
        {
          "src": "/images/screenshots/customers.png",
          "sizes": "1280x720",
          "type": "image/png",
          "form_factor": "wide",
          "label": "Customers Information"
        },
        {
          "src": "/images/screenshots/mobile1.png",
          "sizes": "1170x2532",
          "type": "image/png",
          "label": "Dashboard"
        },
        {
          "src": "/images/screenshots/mobile2.png",
          "sizes": "1170x2532",
          "type": "image/png",
          "label": "Products"
        },
        {
          "src": "/images/screenshots/mobile3.png",
          "sizes": "1170x2532",
          "type": "image/png",
          "label": "Orders"
        },
        {
          "src": "/images/screenshots/mobile4.png",
          "sizes": "1170x2532",
          "type": "image/png",
          "label": "Shop"
        },
      ]
    }

  )
}


