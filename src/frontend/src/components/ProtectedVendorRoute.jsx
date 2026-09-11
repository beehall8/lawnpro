import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'

function ProtectedVendorRoute() {
  const [access, setAccess] = useState('checking')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAccess('denied')
      return undefined
    }

    return onAuthStateChanged(auth, async user => {
      if (!user) {
        sessionStorage.removeItem('lawnProVendorProfile')
        setAccess('denied')
        return
      }

      try {
        const snapshot = await getDoc(doc(db, 'vendorApplications', user.uid))
        const vendor = snapshot.exists() ? snapshot.data() : null
        if (!vendor || vendor.status !== 'APPROVED') throw new Error('Vendor access is not active')
        sessionStorage.setItem('lawnProVendorProfile', JSON.stringify({ id: snapshot.id, ...vendor }))
        setAccess('approved')
      } catch {
        sessionStorage.removeItem('lawnProVendorProfile')
        setAccess('denied')
      }
    })
  }, [])

  if (access === 'checking') return <div className="flex min-h-screen items-center justify-center gap-3 bg-gray-50 text-gray-600"><Loader2 className="animate-spin" /> Checking vendor access…</div>
  if (access === 'denied') return <Navigate to="/vendor/login" replace />
  return <Outlet />
}

export default ProtectedVendorRoute
