export const sortByKeys = [
  'title', 'price', 'isActive', 'stockAvailable', 'createdAt'
] as const
export const sortByKeyValues: { [x in typeof sortByKeys[number]]: string } = {
  createdAt: 'Creation Time',
  title: 'Name',
  price: 'Price',
  stockAvailable: 'Number of Stock',
  isActive: 'Active'
}
