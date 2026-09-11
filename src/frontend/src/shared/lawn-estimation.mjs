export const launchZips = ['30083', '30087', '30088', '30012', '30013', '30094', '30014', '30016']

export function validateAddress(address) {
  if (!address.street?.trim() || !address.city?.trim() || !address.state?.trim() || !address.zip?.trim()) return 'Enter your full street address, city, state, and ZIP code.'
  if (/\bp\.?\s*o\.?\s*box\b|\bpost office box\b/i.test(address.street) || ['30086', '30015'].includes(address.zip.trim())) return 'Use the lawn’s physical street address and ZIP code, not a PO Box.'
  if (!['GA', 'GEORGIA'].includes(address.state.trim().toUpperCase())) return 'We currently serve selected ZIP codes in Georgia.'
  if (!/^\d{5}(?:-\d{4})?$/.test(address.zip.trim())) return 'Enter a valid five-digit ZIP code or ZIP+4.'
  const zip = address.zip.trim().slice(0, 5)
  if (['30086', '30015'].includes(zip)) return 'Use the lawn’s physical street address and ZIP code, not a PO Box.'
  if (!launchZips.includes(zip)) return 'This ZIP code is outside our initial service area. We currently serve selected Stone Mountain, Conyers, and Covington ZIP codes.'
  return ''
}

export function validLawnSize(value) {
  return String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) <= 1000000
}

export const estimateUnavailable = {
  success: false,
  code: 'ESTIMATION_UNAVAILABLE',
  error: 'Automatic lawn measurement is not available yet. Enter your lawn size below, or choose “I don’t know” for professional verification.'
}
