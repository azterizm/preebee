export function formatNumber(arg: number) {
  return Intl.NumberFormat('en-US').format(arg)
}
export function formatNumberCompact(arg: number, options?: Intl.NumberFormatOptions) {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    ...options
  }).format(arg)
}

export function formatList(arg: string[]) {
  return new Intl.ListFormat().format(arg)
}

export function isMobile() {
  return typeof window !== 'undefined' && typeof screen.orientation !== 'undefined'
}

