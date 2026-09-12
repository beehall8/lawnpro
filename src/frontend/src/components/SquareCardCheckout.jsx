import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const squareApplicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID || 'sq0idp-RE8s4KGjqxDz2Uvcg0lSqw'
const squareLocationId = import.meta.env.VITE_SQUARE_LOCATION_ID || 'L37NGBKVQJB1T'

function loadSquareSdk() {
  if (window.Square) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-square-web-payments]')
    if (existing) { existing.addEventListener('load', resolve, { once: true }); existing.addEventListener('error', reject, { once: true }); return }
    const script = document.createElement('script')
    script.src = 'https://web.squarecdn.com/v1/square.js'
    script.async = true
    script.dataset.squareWebPayments = 'true'
    script.onload = resolve
    script.onerror = () => reject(new Error('Square checkout could not load.'))
    document.head.appendChild(script)
  })
}

const SquareCardCheckout = forwardRef(function SquareCardCheckout({ onReady, onError }, ref) {
  const cardRef = useRef(null)
  const [message, setMessage] = useState('Loading secure card form…')

  useEffect(() => {
    let active = true
    loadSquareSdk()
      .then(async () => {
        const payments = window.Square.payments(squareApplicationId, squareLocationId)
        const card = await payments.card()
        await card.attach('#square-card-container')
        if (!active) return
        cardRef.current = card
        setMessage('')
        onReady?.()
      })
      .catch(error => { if (active) { setMessage(error.message || 'Secure card form could not load.'); onError?.(error) } })
    return () => { active = false; cardRef.current?.destroy?.() }
  // The card field is created once. Re-creating it while a customer types
  // would clear their card details.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => ({
    async tokenize() {
      if (!cardRef.current) throw new Error('Secure card form is still loading.')
      const result = await cardRef.current.tokenize()
      if (result.status !== 'OK') throw new Error(result.errors?.[0]?.message || 'Please check your card details and try again.')
      return result.token
    },
  }))

  return <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
    <p className="mb-3 text-sm font-semibold text-gray-800">Secure card payment</p>
    <div id="square-card-container" />
    {message && <p role="status" className="mt-3 text-sm text-gray-600">{message}</p>}
  </div>
})

export default SquareCardCheckout
