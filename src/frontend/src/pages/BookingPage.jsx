import './BookingPage.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, MapPin, Calendar, Clock, DollarSign, Leaf, ShieldCheck, ShoppingCart, Tag, Scissors, Sprout, Wind, Ruler, Droplets } from 'lucide-react'

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
    state: '',
    zip: '',
  })
  const [lawnSize, setLawnSize] = useState('')
  
  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }
  
  const calculateTotal = () => {
    const basePrice = selectedServices.reduce((sum, id) => {
      const service = services.find(s => s.id === id)
      return sum + (service?.price || 0)
    }, 0)
    
    const freq = frequencies.find(f => f.id === frequency)
    return Math.round(basePrice * (freq?.multiplier || 1) * 100) / 100
  }
  
  const handleContinue = () => {
    if (step < 4) setStep(step + 1)
  }
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="booking-layout">
      <aside className="booking-sidebar">
        <Link to="/" className="booking-brand"><Leaf aria-hidden="true" /><span>LAWN <b>PRO</b></span></Link>
        <ol className="booking-steps" aria-label="Booking progress">
          {['Address', 'Services', 'Schedule', 'Payment'].map((label, index) => (
            <li key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''} aria-current={step === index + 1 ? 'step' : undefined}>
              <button type="button" disabled={index + 1 > step} onClick={() => setStep(index + 1)}>
                <span className="step-number">{step > index + 1 ? <Check size={18} /> : index + 1}</span>
                <span><strong>{label}</strong><small>{index === 0 ? (address.street || 'Enter your address') : ['','Select your services','Choose a date & time','Review your selection'][index]}</small></span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500 focus:border-transparent"
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500"
                    placeholder="Austin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500"
                    placeholder="TX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={address.zip}
                  onChange={(e) => setAddress({...address, zip: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500"
                  placeholder="78701"
                />
              </div>
              
              {/* Satellite Estimate Placeholder */}
              <div className="bg-lawn-50 border border-lawn-200 rounded-lg p-4 mt-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="text-lawn-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-lawn-800">AI Lawn Size Estimation</h4>
                    <p className="text-sm text-lawn-700 mt-1">
                      We'll use satellite imagery to estimate your lawn size for accurate pricing.
                      You can adjust the estimate manually in the next step.
                    </p>
                  </div>
                </div>
              </div>
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
                  <span className="service-price">Starting at <strong>${service.price}</strong></span>
                </label>
              })}
            </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="mr-2" size={18} /> Time Window
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500"
                  placeholder="Gate code, pet information, specific areas to focus on, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Review & Payment</h2>
            
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Services ({selectedServices.length})</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frequency: {frequencies.find(f => f.id === frequency)?.name}</span>
                  <span className="text-lawn-600">
                    Save {Math.round((1 - frequencies.find(f => f.id === frequency)?.multiplier || 0) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee</span>
                  <span>${(calculateTotal() * 0.2).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${(calculateTotal() * 1.2).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form Placeholder */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <p className="text-gray-600 text-sm">
                    🔒 Secure payment powered by Stripe (integration required)
                  </p>
                </div>
              </div>
            </div>
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
            onClick={handleContinue}
            disabled={step === 4 || step === 1 && !address.street || step === 2 && selectedServices.length === 0}
            className={`btn-primary px-8 py-3 ${
              (step === 1 && !address.street) || (step === 2 && selectedServices.length === 0)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {step === 4 ? 'Checkout coming soon' : 'Continue'}
          </button>}
        </div>
      </main>
      <aside className="booking-summary">
        <h2>Order Summary</h2>
        <div className="summary-count"><Tag aria-hidden="true" /><div><strong>{selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'} selected</strong><p>{selectedServices.length ? 'Your lawn care estimate' : 'Select one or more services to see your total.'}</p></div></div>
        <div aria-live="polite" aria-atomic="true">
          {services.filter(service => selectedServices.includes(service.id)).map(service => <div className="summary-line" key={service.id}><span>{service.name}</span><span>${service.price.toFixed(2)}</span></div>)}
          <div className="summary-line"><span>Subtotal {frequency !== 'onetime' && '(after discount)'}</span><span>${calculateTotal().toFixed(2)}</span></div>
          <div className="summary-line"><span>Platform fee (20%)</span><span>${(calculateTotal() * 0.2).toFixed(2)}</span></div>
          <div className="summary-total"><span>Estimated total</span><span>${(calculateTotal() * 1.2).toFixed(2)}</span></div>
        </div>
        {step === 2 && <button type="button" className="summary-continue" disabled={!selectedServices.length} onClick={handleContinue}><ShoppingCart size={20} />Continue to Schedule</button>}
        <p className="summary-disclaimer">Preview your services. Online checkout is coming soon.</p>
        <div className="summary-benefits"><div><Calendar /><span><strong>Easy Scheduling</strong>Choose your preferred time.</span></div><div><MapPin /><span><strong>Local Lawn Care</strong>Services for your outdoor space.</span></div><div><Leaf /><span><strong>A Healthier Lawn</strong>Care through every season.</span></div></div>
      </aside>
    </div>
  )
}

export default BookingPage
