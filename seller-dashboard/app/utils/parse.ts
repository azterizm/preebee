export function parseShopName(shopName: string): string {
  shopName = shopName.slice(0, 22)
  return shopName.startsWith('http') ? shopName :
    shopName.toLowerCase().replace(/\s/g, '-').replace(
      /[^a-z0-9-]/g,
      '',
    )
}
