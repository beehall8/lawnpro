export const lawnSizes = [
  { id: 'small', name: 'Small', range: '0–3,000', time: '10–20', min: 35, max: 50 },
  { id: 'medium', name: 'Medium', range: '3,000–6,000', time: '20–35', min: 65, max: 95 },
  { id: 'large', name: 'Large', range: '6,000–10,000', time: '35–50', min: 95, max: 150 },
  { id: 'xl', name: 'XL', range: '10,000+', time: '50–90', min: 125, max: 300, openEnded: true },
]
export function estimateRange(services, size, multiplier = 1) {
  return services.reduce((total, service) => {
    const mowing = service.id === 'mowing' && size
    return { min: total.min + (mowing ? size.min : service.price) * multiplier, max: total.max + (mowing ? size.max : service.price) * multiplier, openEnded: total.openEnded || !!(mowing && size.openEnded) }
  }, { min: 0, max: 0, openEnded: false })
}
export function formatRange(range, multiplier = 1) {
  const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n * multiplier)
  return range.min === range.max ? money(range.min) : `${money(range.min)}–${money(range.max)}${range.openEnded ? '+' : ''}`
}
