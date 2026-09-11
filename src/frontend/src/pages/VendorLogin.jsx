import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Sprout } from 'lucide-react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'

const friendlyError = error => {
  if (error?.code === 'auth/invalid-credential') return 'Invalid email or password.'
  if (error?.code === 'auth/too-many-requests') return 'Too many sign-in attempts. Please wait and try again.'
  return error?.message || 'Sign-in failed.'
}

function VendorLogin() {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [state, setState] = useState({ status: 'idle', message: '' })

  useEffect(() => {
    if (!isFirebaseConfigured) setState({ status: 'error', message: 'Vendor sign-in is not connected yet.' })
  }, [])

  const submit = async event => {
    event.preventDefault()
    if (!isFirebaseConfigured) return
    setState({ status: 'loading', message: '' })

    try {
      const credential = await signInWithEmailAndPassword(auth, credentials.email.trim().toLowerCase(), credentials.password)
      const snapshot = await getDoc(doc(db, 'vendorApplications', credential.user.uid))
      const vendor = snapshot.exists() ? snapshot.data() : null

      if (!vendor || vendor.status !== 'APPROVED') {
        await signOut(auth)
        const message = vendor?.status === 'PENDING'
          ? 'Your application is still pending review.'
          : 'Your vendor account is not approved.'
        throw new Error(message)
      }

      sessionStorage.setItem('lawnProVendorProfile', JSON.stringify({ id: snapshot.id, ...vendor }))
      navigate('/vendor/dashboard', { replace: true })
    } catch (error) {
      setState({ status: 'error', message: friendlyError(error) })
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-lawn-50 to-white px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-lawn-100 bg-white p-8 shadow-xl">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-lawn-700"><Sprout /> Lawn Pro</Link>
        <h1 className="mt-8 text-3xl font-bold text-gray-900">Vendor sign in</h1>
        <p className="mt-2 text-gray-600">Approved providers can access available jobs and earnings.</p>
        {state.status === 'error' && <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"><AlertCircle className="shrink-0" />{state.message}</div>}
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block text-sm font-semibold text-gray-700">Email address<input required type="email" value={credentials.email} onChange={event => setCredentials(current => ({ ...current, email: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="email" /></label>
          <label className="block text-sm font-semibold text-gray-700">Password<input required type="password" value={credentials.password} onChange={event => setCredentials(current => ({ ...current, password: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="current-password" /></label>
          <button disabled={state.status === 'loading' || !isFirebaseConfigured} className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-60" type="submit">{state.status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}Sign in</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">Not approved yet? <Link to="/vendors" className="font-semibold text-lawn-700">Apply to become a Lawn Pro</Link></p>
      </section>
    </main>
  )
}

export default VendorLogin
