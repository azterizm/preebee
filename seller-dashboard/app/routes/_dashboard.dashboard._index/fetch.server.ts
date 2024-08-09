import moment from "moment";
import { prisma } from "~/db.server";

export async function getOrdersInfo(shopId: string) {

  const orders = await prisma.order.findMany({
    where: { shopId },
    select: {
      status: true,
      id: true,
      total: true,
      createdAt: true,
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  const newOrdersTodayCount = await prisma.order.count({
    where: {
      shopId,
      createdAt: {
        gte: moment().subtract(1, 'day').toDate()
      }
    }
  })
  const pendingOrdersCount = await prisma.order.count({
    where: { shopId, status: 'PENDING' }
  })
  const completedOrdersCount = await prisma.order.count({
    where: { shopId, status: 'COMPLETED' }
  })

  return { orders, newOrdersTodayCount, pendingOrdersCount, completedOrdersCount }
}

export async function getTopProducts(shopId: string) {
  const topProductsIds = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    where: { order: { shopId, status: 'COMPLETED' } },
    take: 5,
    orderBy: { _sum: { quantity: 'desc' } }
  })


  return await Promise.all(topProductsIds.map(async r => ({
    count: r._sum.quantity,
    product: await prisma.product.findUnique({
      where: { id: r.productId }, select: {
        id: true,
        title: true,
        price: true,
        stockAvailable: true
      }
    })
  })))
}

export async function getCustomersInfo(shopId: string) {
  const isNew = await isSellerNew(shopId)
  if (isNew) {
    return {
      customersCount: 0,
      topCustomers: []
    }
  }

  const topCustomers = await prisma.deliveryInfo.groupBy({
    by: ['name'],
    _count: { name: true },
    where: { orders: { some: { shopId } } },
    orderBy: { _count: { name: 'desc' } },
    take: 5,
  })
  const customersCount = await prisma.deliveryInfo.findMany({
    distinct: 'name',
    select: { id: true, createdAt: true },
    where: { orders: { some: { shopId } } }
  })

  return {
    customersCount: customersCount.length,
    topCustomers: await Promise.all(topCustomers.map(async r => ({
      name: r.name,
      orders: r._count.name,
      ...await prisma.deliveryInfo.findFirst({
        where: { name: r.name },
        select: { city: true, province: true, id: true }
      })
    })))
  }
}

export async function isSellerNew(shopId: string) {
  const product = await prisma.product.findFirst({
    where: { shopId },
    select: { id: true }
  })
  return !Boolean(product?.id)
}


export async function getIncomeInfo(shopId: string) {
  const isNew = await isSellerNew(shopId)
  if (isNew) {
    return {
      sales: 0,
      total: 0
    }
  }

  const orders = await prisma.order.findMany({
    where: { shopId, status: 'COMPLETED' },
    select: {
      items: {
        where: { product: { shopId } },
        select: { price: true, quantity: true }
      },
    }
  })

  const total = orders.map(r => r.items.map(r => r.price * r.quantity).reduce((a, c) => a + c, 0)).reduce((a, c) => a + c, 0)
  const sales = orders.map(r => r.items.length).reduce((a, c) => a + c, 0)

  return { total, sales }
}

export async function getTopProvinces(shopId: string) {
  return await prisma.deliveryInfo.groupBy({
    by: ['province'],
    _count: { province: true },
    where: { orders: { some: { shopId } } },
    orderBy: { _count: { province: 'desc' } },
  })
}
