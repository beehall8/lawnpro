import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Sprout } from 'lucide-react'
import { apiBaseUrl, apiUrl } from '../utils/api'

function VendorLogin() {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [state, setState] = useState({ status: 'idle', message: '' })

  if (sessionStorage.getItem('lawnProVendorToken')) return <Navigate to="/vendor/dashboard" replace />

  const submit = async (event) => {
    event.preventDefault()
    if (!apiBaseUrl) {
      setState({ status: 'error', message: 'Vendor sign-in is not connected yet.' })
      return
    }
    setState({ status: 'loading', message: '' })
    try {
      const response = await fetch(apiUrl('/api/v1/vendors/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error || 'Sign-in failed.')
      sessionStorage.setItem('lawnProVendorToken', result.data.accessToken)
      sessionStorage.setItem('lawnProVendorProfile', JSON.stringify(result.data.vendor))
      navigate('/vendor/dashboard', { replace: true })
    } catch (error) {
      setState({ status: 'error', message: error.message })
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
          <button disabled={state.status === 'loading'} className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-60" type="submit">{state.status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}Sign in</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">Not approved yet? <Link to="/vendors" className="font-semibold text-lawn-700">Apply to become a Lawn Pro</Link></p>
      </section>
    </main>
  )
}

export default VendorLogin
