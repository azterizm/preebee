
export const orderStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const
export type OrderStatus = typeof orderStatuses[number]
