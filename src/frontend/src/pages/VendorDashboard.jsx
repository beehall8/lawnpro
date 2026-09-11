import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, DollarSign, Star, Clock, CheckCircle, XCircle, Navigation } from 'lucide-react'

const sampleJobs = [
  {
    id: 1,
    address: '123 Oak Street, Austin, TX 78701',
    service: 'Mowing',
    lawnSize: 5200,
    payout: 45,
    distance: 2.3,
    customerRating: 4.8,
    date: 'Today',
    timeWindow: '10:00 AM - 12:00 PM'
  },
  {
    id: 2,
    address: '456 Maple Ave, Austin, TX 78704',
    service: 'Trimming + Edging',
    lawnSize: 3800,
    payout: 55,
    distance: 3.1,
    customerRating: 4.9,
    date: 'Today',
    timeWindow: '2:00 PM - 4:00 PM'
  },
  {
    id: 3,
    address: '789 Pine Rd, Austin, TX 78745',
    service: 'Full Service',
    lawnSize: 8500,
    payout: 95,
    distance: 5.7,
    customerRating: 4.7,
    date: 'Tomorrow',
    timeWindow: '8:00 AM - 10:00 AM'
  },
  {
    id: 4,
    address: '321 Elm Blvd, Austin, TX 78702',
    service: 'Mowing',
    lawnSize: 4200,
    payout: 40,
    distance: 1.8,
    customerRating: 5.0,
    date: 'Tomorrow',
    timeWindow: '12:00 PM - 2:00 PM'
  },
]

function VendorDashboard() {
  const navigate = useNavigate()
  const vendor = JSON.parse(sessionStorage.getItem('lawnProVendorProfile') || '{}')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [filter, setFilter] = useState('all')
  
  const filteredJobs = sampleJobs.filter(job => {
    if (filter === 'today') return job.date === 'Today'
    if (filter === 'tomorrow') return job.date === 'Tomorrow'
    return true
  })
  
  const weeklyEarnings = sampleJobs.reduce((sum, job) => sum + job.payout, 0)
  const jobsCompleted = 12
  const avgRating = 4.8

  const signOut = () => {
    sessionStorage.removeItem('lawnProVendorToken')
    sessionStorage.removeItem('lawnProVendorProfile')
    navigate('/vendor/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-lawn-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🌱</span>
              <span className="font-bold text-xl">Lawn Pro Pro</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm opacity-90">Welcome back,</div>
                <div className="font-semibold">{vendor.businessName || vendor.name || 'Lawn Pro Vendor'}</div>
              </div>
              <button onClick={signOut} className="bg-white text-lawn-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Earnings Summary */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-lawn-50 rounded-lg">
              <DollarSign className="w-8 h-8 mx-auto text-lawn-600 mb-2" />
              <div className="text-2xl font-bold text-lawn-700">${weeklyEarnings}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-700">{jobsCompleted}</div>
              <div className="text-sm text-gray-600">Jobs Completed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Star className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-yellow-700">{avgRating}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-700">4</div>
              <div className="text-sm text-gray-600">Available Jobs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all' ? 'bg-lawn-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'today' ? 'bg-lawn-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('tomorrow')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'tomorrow' ? 'bg-lawn-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tomorrow
            </button>
          </div>
          
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
          >
            <Navigation size={18} />
            <span>{viewMode === 'list' ? 'Map View' : 'List View'}</span>
          </button>
        </div>

        {/* Job List */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.service}</h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin size={16} className="mr-1" />
                        <span className="text-sm">{job.address}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-lawn-600">${job.payout}</div>
                      <div className="text-sm text-gray-600">{job.lawnSize.toLocaleString()} sq ft</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-1" />
                      {job.date}, {job.timeWindow}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Navigation size={16} className="mr-1" />
                      {job.distance} miles
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star size={16} className="mr-1 text-yellow-500 fill-current" />
                      {job.customerRating}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link
                    to={`/vendor/complete/${job.id}`}
                    className="btn-primary px-6 py-3 flex items-center space-x-2"
                  >
                    <CheckCircle size={18} />
                    <span>Accept</span>
                  </Link>
                  <button className="bg-red-100 text-red-700 px-6 py-3 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center space-x-2">
                    <XCircle size={18} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Jobs Available</h3>
            <p className="text-gray-600">Check back later for new opportunities in your area.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorDashboard
