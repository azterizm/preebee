export function separateCartItemsByShop(data: {
  id?: string;
  cartProductId: string
  shippingFee?: number
}[]) {
  const values = data.map(r => r.id).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i) as string[]
  let activeValue: string | null = null
  const result = []

  for (let i = 0; i < values.length; i++) {
    const item: string = values[i];
    activeValue = item
    result.push({
      id: activeValue,
      values: data.filter(r => r.id === activeValue),
      shippingFee: data.find(r => r.id === activeValue)?.shippingFee || 0
    })
  }

  return result.map(r => ({
    shopId: r.id,
    productIds: r.values.map(r => r.cartProductId),
    shippingFee: r.shippingFee
  }))
}
