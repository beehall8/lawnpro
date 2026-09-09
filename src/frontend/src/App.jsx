import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import VendorDashboard from './pages/VendorDashboard'
import ServiceCompletion from './pages/ServiceCompletion'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/complete/:jobId" element={<ServiceCompletion />} />
      </Routes>
    </div>
  )
}

export default App
