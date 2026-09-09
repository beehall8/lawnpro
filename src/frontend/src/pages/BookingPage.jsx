import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, MapPin, Calendar, Clock, DollarSign } from 'lucide-react'

const services = [
  { id: 'mowing', name: 'Mowing', price: 35, icon: '🌱', description: 'Professional lawn mowing with cleanup' },
  { id: 'trimming', name: 'Trimming', price: 25, icon: '✂️', description: 'Edge trimming around obstacles' },
  { id: 'edging', name: 'Edging', price: 20, icon: '📏', description: 'Clean edges along sidewalks' },
  { id: 'fertilizing', name: 'Fertilizing', price: 45, icon: '💧', description: 'Lawn fertilization treatment' },
  { id: 'weed-control', name: 'Weed Control', price: 40, icon: '🌿', description: 'Weed removal and prevention' },
  { id: 'leaf-removal', name: 'Leaf Removal', price: 30, icon: '🍂', description: 'Fall leaf cleanup service' },
]

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center space-x-2 text-lawn-600">
            <span className="text-2xl">🌱</span>
            <span className="font-bold">Lawn Pro</span>
          </Link>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {['Address', 'Services', 'Schedule', 'Payment'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step > index + 1 ? 'bg-lawn-600 text-white' :
                  step === index + 1 ? 'bg-lawn-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > index + 1 ? <Check size={16} /> : index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === index + 1 ? 'text-lawn-600' : 'text-gray-600'
                }`}>{label}</span>
                {index < 3 && <ChevronRight className="mx-2 text-gray-400" size={16} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
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
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Select Your Services</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`service-card relative ${
                    selectedServices.includes(service.id) ? 'selected' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-3xl">{service.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-lawn-600">${service.price}</p>
                      {selectedServices.includes(service.id) && (
                        <Check className="text-lawn-600 ml-auto mt-1" size={20} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
          <button
            onClick={handleContinue}
            disabled={step === 1 && !address.street || step === 2 && selectedServices.length === 0}
            className={`btn-primary px-8 py-3 ${
              (step === 1 && !address.street) || (step === 2 && selectedServices.length === 0)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {step === 4 ? 'Place Order' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
