import { createHash, randomUUID } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https'

initializeApp()

const db = getFirestore()
const squareAccessToken = defineSecret('SQUARE_ACCESS_TOKEN')
const squareLocationId = 'L37NGBKVQJB1T'
const depositRate = 0.25
const allowedOrigins = new Set(['https://lawnproatl.com', 'https://www.lawnproatl.com'])

const services = {
  mowing: { name: 'Mowing', price: 35 },
  trimming: { name: 'Trimming', price: 25 },
  edging: { name: 'Edging', price: 20 },
  fertilizing: { name: 'Fertilizing', price: 45 },
  'weed-control': { name: 'Weed Control', price: 40 },
  'leaf-removal': { name: 'Leaf Removal', price: 30 },
}

const lawnMowingPrices = { small: 35, medium: 50, large: 70, xl: 95 }
const frequencies = { onetime: { name: 'One-Time', multiplier: 1 }, biweekly: { name: 'Every 2 Weeks', multiplier: 0.9 }, weekly: { name: 'Weekly', multiplier: 0.85 } }

function setCors(req, res) {
  const origin = req.get('origin')
  if (origin && allowedOrigins.has(origin)) res.set('Access-Control-Allow-Origin', origin)
  res.set('Vary', 'Origin')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
}

function fail(res, status, message) {
  return res.status(status).json({ ok: false, message })
}

function normalizedJob(input) {
  const job = input || {}
  const selectedServices = Array.isArray(job.services) ? [...new Set(job.services)] : []
  const frequency = frequencies[job.frequency] ? job.frequency : 'onetime'
  const selectedFrequency = frequencies[frequency]
  const address = job.address || {}
  const validText = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max

  if (!validText(job.customerName, 120) || !validText(job.customerEmail, 254) || !validText(job.customerPhone, 40)
    || !validText(address.street, 160) || !validText(address.city, 80) || address.state?.trim().toUpperCase() !== 'GA'
    || !/^\d{5}$/.test(address.zip?.trim() || '') || !/^\d{4}-\d{2}-\d{2}$/.test(job.scheduledDate || '')
    || !validText(job.timeWindow, 40) || selectedServices.length === 0 || selectedServices.some(id => !services[id])) return null

  if (selectedServices.includes('mowing') && !lawnMowingPrices[job.lawnSizeId]) return null

  const baseAmount = selectedServices.reduce((sum, id) => sum + (id === 'mowing' ? lawnMowingPrices[job.lawnSizeId] : services[id].price), 0)
  const serviceSubtotalCents = Math.round(baseAmount * selectedFrequency.multiplier * 100)
  const platformFeeCents = Math.round(serviceSubtotalCents * 0.2)
  const totalCents = serviceSubtotalCents + platformFeeCents
  const depositCents = Math.round(totalCents * depositRate)

  return {
    customerName: job.customerName.trim(), customerEmail: job.customerEmail.trim().toLowerCase(), customerPhone: job.customerPhone.trim(),
    address: { street: address.street.trim(), city: address.city.trim(), state: 'GA', zip: address.zip.trim() },
    services: selectedServices, serviceNames: selectedServices.map(id => services[id].name),
    frequency, frequencyName: selectedFrequency.name,
    lawnSizeId: job.lawnSizeId || null, lawnSizeName: typeof job.lawnSizeName === 'string' ? job.lawnSizeName.slice(0, 80) : null,
    lawnSizeRange: typeof job.lawnSizeRange === 'string' ? job.lawnSizeRange.slice(0, 80) : null,
    measuredArea: typeof job.measuredArea === 'number' ? job.measuredArea : null,
    scheduledDate: job.scheduledDate, timeWindow: job.timeWindow.trim(), notes: typeof job.notes === 'string' ? job.notes.trim().slice(0, 1000) : '',
    estimatedMin: totalCents / 100, estimatedMax: totalCents / 100, estimateOpenEnded: false,
    pricing: { serviceSubtotalCents, platformFeeCents, totalCents, depositCents, balanceCents: totalCents - depositCents, currency: 'USD', depositRate },
  }
}

export const createSquarePayment = onRequest({ region: 'us-central1', secrets: [squareAccessToken] }, async (req, res) => {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).send('')
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed.')
  if (req.get('origin') && !allowedOrigins.has(req.get('origin'))) return fail(res, 403, 'This checkout is not available from this site.')

  const { sourceId, checkoutId, job: rawJob } = req.body || {}
  if (typeof sourceId !== 'string' || sourceId.length < 10 || typeof checkoutId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(checkoutId)) return fail(res, 400, 'Your payment details could not be verified. Please try again.')
  const job = normalizedJob(rawJob)
  if (!job) return fail(res, 400, 'Please complete the booking details before paying the deposit.')

  const jobRef = db.collection('jobs').doc(`square-${checkoutId}`)
  const existing = await jobRef.get()
  if (existing.exists) return res.status(200).json({ ok: true, jobId: existing.id, ...existing.data().pricing })

  const idempotencyKey = createHash('sha256').update(checkoutId).digest('hex')
  let squareResponse
  try {
    squareResponse = await fetch('https://connect.squareup.com/v2/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${squareAccessToken.value()}`, 'Content-Type': 'application/json', 'Square-Version': '2025-10-16' },
      body: JSON.stringify({ source_id: sourceId, idempotency_key: idempotencyKey, location_id: squareLocationId, amount_money: { amount: job.pricing.depositCents, currency: 'USD' }, reference_id: checkoutId, note: 'Lawn Pro 25% booking deposit' }),
    })
  } catch {
    return fail(res, 503, 'We could not reach the payment service. Please try again.')
  }

  const squareData = await squareResponse.json()
  const payment = squareData.payment
  if (!squareResponse.ok || !payment || payment.status !== 'COMPLETED') {
    console.error('Square payment failed', squareData.errors?.map(error => error.code))
    return fail(res, 402, squareData.errors?.[0]?.detail || 'Your card was not charged. Please check the details and try again.')
  }

  await jobRef.set({
    ...job, status: 'PENDING', assignedVendorId: null, createdAt: FieldValue.serverTimestamp(), acceptedAt: null,
    payment: { provider: 'SQUARE', paymentId: payment.id, status: payment.status, depositPaidAt: FieldValue.serverTimestamp(), idempotencyKey },
  })
  return res.status(201).json({ ok: true, jobId: jobRef.id, ...job.pricing })
})

async function squareRequest(path, token, body) {
  const response = await fetch(`https://connect.squareup.com${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Square-Version': '2025-10-16' },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) {
    console.error('Square request failed', path, data.errors?.map(error => error.code))
    throw new Error(data.errors?.[0]?.detail || 'Square could not create the final payment request.')
  }
  return data
}

const finalPaymentKey = (jobId, operation) => createHash('sha256').update(`lawnpro:${jobId}:${operation}`).digest('hex').slice(0, 45)

export const requestFinalPayment = onCall({ region: 'us-central1', secrets: [squareAccessToken] }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Please sign in again.')
  const { jobId, photoUrls, notes } = request.data || {}
  if (typeof jobId !== 'string' || !Array.isArray(photoUrls) || photoUrls.length < 1 || photoUrls.length > 6
    || photoUrls.some(url => typeof url !== 'string' || !url.startsWith('https://firebasestorage.googleapis.com/'))
    || (notes !== undefined && (typeof notes !== 'string' || notes.length > 1000))) {
    throw new HttpsError('invalid-argument', 'Upload at least one finished-job photo before marking this job complete.')
  }

  const jobRef = db.collection('jobs').doc(jobId)
  let job
  try {
    await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(jobRef)
      if (!snapshot.exists) throw new HttpsError('not-found', 'This job no longer exists.')
      const current = snapshot.data()
      if (current.assignedVendorId !== request.auth.uid || current.status !== 'ACCEPTED') throw new HttpsError('permission-denied', 'Only the assigned vendor can complete this job.')
      if (!Number.isInteger(current.pricing?.balanceCents) || current.pricing.balanceCents < 1) throw new HttpsError('failed-precondition', 'The remaining balance is not available for this job.')
      job = current
      transaction.update(jobRef, { status: 'FINAL_PAYMENT_PROCESSING' })
    })
  } catch (error) {
    if (error instanceof HttpsError) throw error
    throw new HttpsError('aborted', 'This job is already being completed. Please refresh the dashboard.')
  }
  const balanceCents = job.pricing.balanceCents

  try {
    const token = squareAccessToken.value()
    const customer = await squareRequest('/v2/customers', token, {
      idempotency_key: finalPaymentKey(jobId, 'customer'), given_name: job.customerName, email_address: job.customerEmail, phone_number: job.customerPhone,
      reference_id: `lawnpro-job-${jobId}`,
    })
    const order = await squareRequest('/v2/orders', token, {
      idempotency_key: finalPaymentKey(jobId, 'order'), order: {
        location_id: squareLocationId,
        reference_id: jobId,
        line_items: [{ name: 'Lawn Pro remaining service balance', quantity: '1', base_price_money: { amount: balanceCents, currency: 'USD' } }],
      },
    })
    const invoiceResponse = await squareRequest('/v2/invoices', token, {
      idempotency_key: finalPaymentKey(jobId, 'invoice'), invoice: {
        location_id: squareLocationId, order_id: order.order.id,
        primary_recipient: { customer_id: customer.customer.id },
        delivery_method: 'EMAIL', title: 'Lawn Pro service balance',
        description: 'Your lawn service is complete. Please pay the remaining balance using this secure Square invoice.',
        payment_requests: [{ request_type: 'BALANCE', due_date: new Date().toISOString().slice(0, 10) }],
      },
    })
    const published = await squareRequest(`/v2/invoices/${invoiceResponse.invoice.id}/publish`, token, {
      version: invoiceResponse.invoice.version,
      idempotency_key: finalPaymentKey(jobId, 'publish'),
    })
    await jobRef.update({
      status: 'AWAITING_FINAL_PAYMENT',
      completion: { photoUrls, notes: notes?.trim() || '', completedAt: FieldValue.serverTimestamp(), completedBy: request.auth.uid },
      finalPayment: { provider: 'SQUARE_INVOICE', invoiceId: published.invoice.id, orderId: order.order.id, customerId: customer.customer.id, status: published.invoice.status, balanceCents, sentAt: FieldValue.serverTimestamp() },
    })
    return { ok: true, invoiceStatus: published.invoice.status, balanceCents }
  } catch (error) {
    console.error('Final payment request failed', error)
    await jobRef.update({ status: 'ACCEPTED' }).catch(() => {})
    throw new HttpsError('internal', 'We could not send the final payment request. Please try again.')
  }
})
