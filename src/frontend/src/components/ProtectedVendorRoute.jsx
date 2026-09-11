import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { apiBaseUrl, apiUrl } from '../utils/api'

function ProtectedVendorRoute() {
  const [access, setAccess] = useState('checking')

  useEffect(() => {
    const token = sessionStorage.getItem('lawnProVendorToken')
    if (!token || !apiBaseUrl) {
      setAccess('denied')
      return
    }

    fetch(apiUrl('/api/v1/vendors/me'), { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        if (!response.ok) throw new Error('Unauthorized')
        return response.json()
      })
      .then(result => {
        sessionStorage.setItem('lawnProVendorProfile', JSON.stringify(result.data))
        setAccess('approved')
      })
      .catch(() => {
        sessionStorage.removeItem('lawnProVendorToken')
        sessionStorage.removeItem('lawnProVendorProfile')
        setAccess('denied')
      })
  }, [])

  if (access === 'checking') return <div className="flex min-h-screen items-center justify-center gap-3 bg-gray-50 text-gray-600"><Loader2 className="animate-spin" /> Checking vendor access…</div>
  if (access === 'denied') return <Navigate to="/vendor/login" replace />
  return <Outlet />
}

export default ProtectedVendorRoute
