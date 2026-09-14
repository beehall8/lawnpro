import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import BookingConfirmation from './pages/BookingConfirmation'
import VendorDashboard from './pages/VendorDashboard'
import ServiceCompletion from './pages/ServiceCompletion'
import VendorPage from './pages/VendorPage'
import AdminVendorApplications from './pages/AdminVendorApplications'
import VendorLogin from './pages/VendorLogin'
import ProtectedVendorRoute from './components/ProtectedVendorRoute'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/booking-confirmation/:jobId" element={<BookingConfirmation />} />
        <Route path="/vendors" element={<VendorPage />} />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route element={<ProtectedVendorRoute />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/complete/:jobId" element={<ServiceCompletion />} />
        </Route>
        <Route path="/admin/vendors" element={<AdminVendorApplications />} />
      </Routes>
    </div>
  )
}

export default App
