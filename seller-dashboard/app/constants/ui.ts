

export const navData: {
  label: string
  to: string | { label: string; to: string; icon?: React.ReactNode }[]
  icon?: React.ReactNode
}[] = [
  {
    label: 'Home',
    to: '/dashboard',
  },
  {
    label: 'Products',
    to: '/products',
  },
  {
    label: 'Orders',
    to: '/order',
  },
  {
    label: 'Customers',
    to: '/customers',
  },
  {
    label: 'Customize',
    to: '/customize',
  },
  {
    label: 'Profile',
    to: '/profile',
  },
]
