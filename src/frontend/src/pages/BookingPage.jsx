import YardSizeMap from '../components/YardSizeMap'
import './BookingPage.css'
import { useRef, useState } from 'react'
import { launchZips, validateAddress } from '../shared/lawn-estimation.mjs'
import { lawnSizes, estimateRange, formatRange } from '../shared/lawn-sizes.mjs'
import { Link } from 'react-router-dom'
import SquareCardCheckout from '../components/SquareCardCheckout'
import { AlertCircle, Check, CheckCircle, MapPin, Calendar, Clock, Leaf, Loader2, ShieldCheck, ShoppingCart, Tag, Scissors, Sprout, Wind, Ruler, Droplets } from 'lucide-react'

const services = [
  { id: 'mowing', name: 'Mowing', price: 35, icon: '🌱', description: 'Professional lawn mowing with cleanup' },
  { id: 'trimming', name: 'Trimming', price: 25, icon: '✂️', description: 'Edge trimming around obstacles' },
  { id: 'edging', name: 'Edging', price: 20, icon: '📏', description: 'Clean edges along sidewalks' },
  { id: 'fertilizing', name: 'Fertilizing', price: 45, icon: '💧', description: 'Lawn fertilization treatment' },
  { id: 'weed-control', name: 'Weed Control', price: 40, icon: '🌿', description: 'Weed removal and prevention' },
  { id: 'leaf-removal', name: 'Leaf Removal', price: 30, icon: '🍂', description: 'Fall leaf cleanup service' },
]

const serviceIcons = { mowing: Sprout, trimming: Scissors, edging: Ruler, fertilizing: Droplets, 'weed-control': Leaf, 'leaf-removal': Wind }

const frequencies = [
  { id: 'onetime', name: 'One-Time', multiplier: 1, popular: false },
  { id: 'biweekly', name: 'Every 2 Weeks', multiplier: 0.9, popular: true },
  { id: 'weekly', name: 'Weekly', multiplier: 0.85, popular: false },
]

function BookingPage() {
  const [step, setStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState([])
  const [frequency, setFrequency] = useState('onetime')
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: 'GA',
    zip: '',
  })
  const [lawnSize, setLawnSize] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [measuredArea, setMeasuredArea] = useState(null)
  const [addressConfirmed, setAddressConfirmed] = useState(false)
  const [schedule, setSchedule] = useState({ date: '', timeWindow: '8:00 AM - 10:00 AM', notes: '' })
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [submission, setSubmission] = useState({ status: 'idle', message: '' })
  const squareCard = useRef(null)
  const selectedSize = lawnSizes.find(size => size.id === lawnSize)
  const now = new Date()
  const earliestScheduleDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const addressError = validateAddress(address)
  const canContinueAddress = !addressError && addressConfirmed && !!selectedSize
  const updateAddress = (field, value) => {
    setAddress(previous => ({ ...previous, [field]: value }))
    setAddressConfirmed(false)
    setShowMap(false)
    setMeasuredArea(null)
    setLawnSize('')
  }
  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }
  
  const total = estimateRange(services.filter(service => selectedServices.includes(service.id)), selectedSize, frequencies.find(f => f.id === frequency)?.multiplier || 1)
  // Checkout uses the displayed starting estimate. The function independently
  // recalculates this amount before it asks Square to charge the card.
  const checkoutTotalCents = Math.round(total.min * 1.2 * 100)
  const depositCents = Math.round(checkoutTotalCents * 0.25)
  const balanceCents = checkoutTotalCents - depositCents
  const money = cents => `$${(cents / 100).toFixed(2)}`

  const handleContinue = () => {
    if (step === 1 && !canContinueAddress) return
    if (step === 2 && !selectedServices.length) return
    if (step === 3 && !schedule.date) return
    if (step < 4) setStep(step + 1)
  }
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const submitJob = async () => {
    if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim()) {
      setSubmission({ status: 'error', message: 'Enter your name, email, and phone number before submitting.' })
      return
    }

    setSubmission({ status: 'loading', message: '' })
    try {
      const sourceId = await squareCard.current?.tokenize()
      if (!sourceId) throw new Error('Secure card form is still loading.')
      const response = await fetch(import.meta.env.VITE_SQUARE_PAYMENT_ENDPOINT || 'https://us-central1-lawnproatl-85df0.cloudfunctions.net/createSquarePayment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId, checkoutId: crypto.randomUUID(),
          job: {
            customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone, address,
            services: selectedServices, frequency, lawnSizeId: selectedSize?.id, lawnSizeName: selectedSize?.name,
            lawnSizeRange: selectedSize?.range, measuredArea, scheduledDate: schedule.date, timeWindow: schedule.timeWindow, notes: schedule.notes,
          },
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.ok) throw new Error(result.message || 'We could not process your booking deposit.')
      setSubmission({ status: 'success', message: `Your ${money(result.depositCents)} booking deposit was received. A Lawn Pro will claim the job shortly.` })
    } catch (error) {
      setSubmission({
        status: 'error',
        message: error?.message || 'We could not process your booking deposit. Please try again.',
      })
    }
  }

  if (submission.status === 'success') {
    return <main className="grid min-h-screen place-items-center bg-lawn-50 px-4">
      <section className="card max-w-lg text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-lawn-600" />
        <h1 className="mt-5 text-3xl font-bold text-gray-900">Service request received</h1>
        <p className="mt-3 text-gray-600">{submission.message}</p>
        <Link to="/" className="btn-primary mt-7 inline-block">Return home</Link>
      </section>
    </main>
  }

  return (
    <div className="booking-layout">
      <aside className="booking-sidebar">
        <Link to="/" className="booking-brand"><Leaf aria-hidden="true" /><span>LAWN <b>PRO</b></span></Link>
        <ol className="booking-steps" aria-label="Booking progress">
          {['Address', 'Services', 'Schedule', 'Review'].map((label, index) => (
            <li key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''} aria-current={step === index + 1 ? 'step' : undefined}>
              <button type="button" disabled={index + 1 > step} onClick={() => setStep(index + 1)}>
                <span className="step-number">{step > index + 1 ? <Check size={18} /> : index + 1}</span>
                <span><strong>{label}</strong><small>{index === 0 ? (address.street || 'Enter your address') : ['','Select your services','Choose a date & time','Submit your request'][index]}</small></span>
              </button>
            </li>
          ))}
        </ol>
        <div className="booking-help"><Leaf /><strong>A little care. A greener lawn.</strong><p>Choose the services that fit your outdoor space.</p></div>
      </aside>
      <main className="booking-main">
        {/* Step 1: Address */}
        {step === 1 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Where's your lawn?</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="address-street" className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  id="address-street"
                  value={address.street}
                  onChange={(e) => updateAddress('street', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500 focus:border-transparent"
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address-city" className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    id="address-city"
                  value={address.city}
                    onChange={(e) => updateAddress('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500"
                    placeholder="Stone Mountain"
                  />
                </div>
                <div>
                  <label htmlFor="address-state" className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    id="address-state"
                  value={address.state}
                    onChange={(e) => updateAddress('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500"
                    placeholder="GA"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="address-zip" className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  id="address-zip"
                  value={address.zip}
                  onChange={(e) => updateAddress('zip', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500"
                  placeholder="30083"
                />
              </div>
              
              <p className="text-sm text-gray-600">Launch area: Stone Mountain, Conyers, and Covington. ZIP codes: {launchZips.join(', ')}.</p>
              {address.zip && addressError && <p role="status" className="text-sm text-red-700">{addressError}</p>}
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1" checked={addressConfirmed} disabled={!!addressError} onChange={e => setAddressConfirmed(e.target.checked)} />
                <span>This is the physical address of the lawn I want serviced.</span>
              </label>
              <fieldset className="lawn-size-section">
                <legend>Choose your lawn size</legend>
                <p>Select the closest range for the grass area you want mowed. Prices and times below are averages for professional mowing.</p>
                <button type="button" className="btn-primary my-3" disabled={!!addressError || !addressConfirmed} onClick={() => setShowMap(value => !value)}>{showMap ? 'Hide map' : 'Help me measure my lawn'}</button>
                {showMap && <YardSizeMap address={`${address.street}, ${address.city}, ${address.state} ${address.zip}`} onSizeConfirmed={({ areaSqFt }) => { setMeasuredArea(areaSqFt); setLawnSize(areaSqFt <= 3000 ? 'small' : areaSqFt <= 6000 ? 'medium' : areaSqFt < 10000 ? 'large' : 'xl') }} />}
                {measuredArea && <p role="status">Your confirmed outline: {measuredArea.toLocaleString()} sq ft. You can override the suggested tier below.</p>}
                <div className="lawn-size-grid">
                  {lawnSizes.map(size => <label key={size.id} className={`lawn-size-card ${lawnSize === size.id ? 'is-selected' : ''}`}>
                    <input type="radio" name="lawn-size" value={size.id} checked={lawnSize === size.id} onChange={() => setLawnSize(size.id)} />
                    <Sprout aria-hidden="true" />
                    <strong>{size.name}</strong>
                    <span>{size.range} sq ft</span>
                    <span>{size.time} min · Pro average</span>
                    <b>{formatRange(size)}</b>
                    <small>Average mowing price</small>
                  </label>)}
                </div>
                <p className="text-sm">At 3,000 or 6,000 sq ft, choose the smaller tier; at 10,000 sq ft, choose XL. Final pricing depends on lawn conditions. Platform fee is additional.</p>
              </fieldset>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div className="service-selection">
            <header className="selection-heading"><h1><Sprout aria-hidden="true" />Select Your Services</h1><p>Choose the services you need for a healthy, beautiful lawn.</p></header>
            <div className="booking-service-grid">
              {services.map((service) => {
                const Icon = serviceIcons[service.id]
                return <label key={service.id} className={`booking-service-card ${selectedServices.includes(service.id) ? 'is-selected' : ''}`}>
                  <input type="checkbox" checked={selectedServices.includes(service.id)} onChange={() => toggleService(service.id)} aria-label={`Select ${service.name}`} />
                  <span className="service-art"><Icon aria-hidden="true" strokeWidth={1.4} /></span>
                  <h2>{service.name}</h2><p>{service.description}</p>
                  <span className="service-price">{service.id === 'mowing' && selectedSize ? 'Average price' : 'Starting at'} <strong>{service.id === 'mowing' && selectedSize ? formatRange(selectedSize) : `$${service.price}`}</strong></span>
                  {service.id === 'mowing' && selectedSize && <span className="mowing-size-detail">{selectedSize.name} · {selectedSize.range} sq ft<br />{selectedSize.time} min · Pro average</span>}
                </label>
              })}
            </div>
            {selectedServices.includes('mowing') && <section className="yard-map-panel" aria-labelledby="mowing-map-heading">
              <h2 id="mowing-map-heading" className="text-xl font-semibold">Measure your lawn for mowing</h2>
              <p>Outline the grass on a satellite map to choose the matching lawn-size tier.</p>
              <button type="button" className="btn-primary" onClick={() => setShowMap(value => !value)}>{showMap ? 'Hide map' : 'Measure my lawn on map'}</button>
              {showMap && <YardSizeMap address={`${address.street}, ${address.city}, ${address.state} ${address.zip}`} onSizeConfirmed={({ areaSqFt }) => { setMeasuredArea(areaSqFt); setLawnSize(areaSqFt <= 3000 ? 'small' : areaSqFt <= 6000 ? 'medium' : areaSqFt < 10000 ? 'large' : 'xl') }} />}
              {measuredArea && <p role="status">Confirmed outline: {measuredArea.toLocaleString()} sq ft · {selectedSize?.name} lawn</p>}
            </section>}
            <div className="service-note"><ShieldCheck aria-hidden="true" /><div><strong>Lawn care that fits your needs</strong><p>Select one or more services to build your estimate.</p></div></div>

            {/* Frequency Selection */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">How often?</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {frequencies.map((freq) => (
                  <button
                    key={freq.id}
                    onClick={() => setFrequency(freq.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      frequency === freq.id
                        ? 'border-lawn-600 bg-lawn-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{freq.name}</div>
                    {freq.multiplier < 1 && (
                      <div className="text-sm text-lawn-600 font-medium">
                        Save {Math.round((1 - freq.multiplier) * 100)}%
                      </div>
                    )}
                    {freq.popular && (
                      <div className="text-xs bg-lawn-600 text-white inline-block px-2 py-1 rounded mt-1">
                        Most Popular
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Choose a Date & Time</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="mr-2" size={18} /> Preferred Date
                </label>
                <input
                  type="date"
                  required
                  min={earliestScheduleDate}
                  value={schedule.date}
                  onChange={event => setSchedule(current => ({ ...current, date: event.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="mr-2" size={18} /> Time Window
                </label>
                <select value={schedule.timeWindow} onChange={event => setSchedule(current => ({ ...current, timeWindow: event.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500">
                  <option>8:00 AM - 10:00 AM</option>
                  <option>10:00 AM - 12:00 PM</option>
                  <option>12:00 PM - 2:00 PM</option>
                  <option>2:00 PM - 4:00 PM</option>
                  <option>4:00 PM - 6:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={schedule.notes}
                  onChange={event => setSchedule(current => ({ ...current, notes: event.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500"
                  placeholder="Gate code, pet information, specific areas to focus on, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review and contact */}
        {step === 4 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-2">Review your request</h2>
            <p className="mb-6 text-gray-600">Tell us how to reach you, then securely pay your 25% booking deposit.</p>
            
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Services ({selectedServices.length})</span>
                  <span>{formatRange(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frequency: {frequencies.find(f => f.id === frequency)?.name}</span>
                  <span className="text-lawn-600">
                    Save {Math.round((1 - frequencies.find(f => f.id === frequency)?.multiplier || 0) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee</span>
                  <span>{formatRange(total, 0.2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Starting at {money(checkoutTotalCents)}</span>
                </div>
                <div className="flex justify-between text-lawn-700 font-semibold">
                  <span>Due today (25% deposit)</span>
                  <span>{money(depositCents)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Remaining balance due after service</span>
                  <span>{money(balanceCents)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-700 md:col-span-2">Name<input required maxLength={120} value={customer.name} onChange={event => setCustomer(current => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:ring-2 focus:ring-lawn-500" /></label>
              <label className="block text-sm font-semibold text-gray-700">Email<input required type="email" maxLength={254} value={customer.email} onChange={event => setCustomer(current => ({ ...current, email: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:ring-2 focus:ring-lawn-500" /></label>
              <label className="block text-sm font-semibold text-gray-700">Phone number<input required type="tel" maxLength={40} value={customer.phone} onChange={event => setCustomer(current => ({ ...current, phone: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:ring-2 focus:ring-lawn-500" /></label>
            </div>
            <SquareCardCheckout ref={squareCard} onError={(error) => setSubmission({ status: 'error', message: error.message || 'Secure checkout could not load.' })} />
            {submission.status === 'error' && <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"><AlertCircle className="shrink-0" />{submission.message}</div>}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-semibold ${
              step === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            Back
          </button>
          {step !== 2 && <button
            onClick={step === 4 ? submitJob : handleContinue}
            disabled={submission.status === 'loading' || step === 1 && !canContinueAddress || step === 3 && !schedule.date}
            className={`btn-primary px-8 py-3 ${
              (step === 1 && !canContinueAddress) || (step === 3 && !schedule.date)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {submission.status === 'loading' ? <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Processing payment…</span> : step === 4 ? `Pay ${money(depositCents)} deposit` : 'Continue'}
          </button>}
        </div>
      </main>
      <aside className="booking-summary">
        <h2>Order Summary</h2>
        {selectedSize && <div className="summary-count"><Ruler aria-hidden="true" /><div><strong>{selectedSize.name} lawn · {selectedSize.range} sq ft</strong><p>{selectedSize.time} min average mowing time</p><button type="button" className="underline text-sm" onClick={() => setStep(1)}>Change lawn size</button></div></div>}
        <div className="summary-count"><Tag aria-hidden="true" /><div><strong>{selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'} selected</strong><p>{selectedServices.length ? 'Your lawn care estimate' : 'Select one or more services to see your total.'}</p></div></div>
        <div aria-live="polite" aria-atomic="true">
          {services.filter(service => selectedServices.includes(service.id)).map(service => <div className="summary-line" key={service.id}><span>{service.name}</span><span>{service.id === 'mowing' && selectedSize ? formatRange(selectedSize) : `$${service.price.toFixed(2)}`}</span></div>)}
          <div className="summary-line"><span>Subtotal {frequency !== 'onetime' && '(after discount)'}</span><span>{formatRange(total)}</span></div>
          <div className="summary-line"><span>Platform fee (20%)</span><span>{formatRange(total, 0.2)}</span></div>
          <div className="summary-total"><span>Estimated total</span><span>{formatRange(total, 1.2)}</span></div>
        </div>
        {step === 2 && <button type="button" className="summary-continue" disabled={!selectedServices.length} onClick={handleContinue}><ShoppingCart size={20} />Continue to Schedule</button>}
        <p className="summary-disclaimer">A 25% deposit based on the displayed starting estimate is paid online. The remaining balance is due after service; lawn conditions can affect final pricing.</p>
        <div className="summary-benefits"><div><Calendar /><span><strong>Easy Scheduling</strong>Choose your preferred time.</span></div><div><MapPin /><span><strong>Local Lawn Care</strong>Services for your outdoor space.</span></div><div><Leaf /><span><strong>A Healthier Lawn</strong>Care through every season.</span></div></div>
      </aside>
    </div>
  )
}

export default BookingPage
