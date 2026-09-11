import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, BadgeCheck, Check, Clock3, Loader2, LogOut, Mail, MapPin, Phone, Sprout, X } from 'lucide-react'
import { apiBaseUrl, apiUrl } from '../utils/api'

const filters = ['PENDING', 'APPROVED', 'REJECTED', 'ALL']

const statusStyles = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  APPROVED: 'border-lawn-200 bg-lawn-50 text-lawn-800',
  REJECTED: 'border-red-200 bg-red-50 text-red-800',
}

function AdminVendorApplications() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('lawnProVendorAdminKey') || '')
  const [draftKey, setDraftKey] = useState('')
  const [filter, setFilter] = useState('PENDING')
  const [applications, setApplications] = useState([])
  const [counts, setCounts] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0 })
  const [state, setState] = useState({ status: 'idle', message: '' })
  const [updatingId, setUpdatingId] = useState('')

  const loadApplications = useCallback(async () => {
    if (!adminKey || !apiBaseUrl) return
    setState({ status: 'loading', message: '' })

    try {
      const query = filter === 'ALL' ? '' : `?status=${filter}`
      const response = await fetch(apiUrl(`/api/v1/vendors/applications${query}`), {
        headers: { 'x-admin-key': adminKey },
      })
      const result = await response.json().catch(() => null)

      if (!response.ok) throw new Error(result?.error || 'Applications could not be loaded.')

      setApplications(result.data || [])
      setCounts(result.counts || { PENDING: 0, APPROVED: 0, REJECTED: 0 })
      setState({ status: 'ready', message: '' })
    } catch (error) {
      if (/passcode/i.test(error.message)) {
        sessionStorage.removeItem('lawnProVendorAdminKey')
        setAdminKey('')
      }
      setState({ status: 'error', message: error.message })
    }
  }, [adminKey, filter])

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  const signIn = (event) => {
    event.preventDefault()
    const value = draftKey.trim()
    if (!value) return
    sessionStorage.setItem('lawnProVendorAdminKey', value)
    setAdminKey(value)
    setDraftKey('')
  }

  const signOut = () => {
    sessionStorage.removeItem('lawnProVendorAdminKey')
    setAdminKey('')
    setApplications([])
    setState({ status: 'idle', message: '' })
  }

  const review = async (id, status) => {
    setUpdatingId(id)
    setState(current => ({ ...current, message: '' }))
    try {
      const response = await fetch(apiUrl(`/api/v1/vendors/applications/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ status }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error || 'The application could not be updated.')
      await loadApplications()
    } catch (error) {
      setState({ status: 'error', message: error.message })
    } finally {
      setUpdatingId('')
    }
  }

  if (!apiBaseUrl) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <section className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-white p-8 shadow-lg">
          <AlertCircle className="h-10 w-10 text-amber-600" />
          <h1 className="mt-5 text-3xl font-bold text-gray-900">Admin queue needs its database connection</h1>
          <p className="mt-3 text-gray-600">The review page is ready, but the live site still needs its backend URL before applications can appear here.</p>
          <Link to="/" className="mt-7 inline-flex font-semibold text-lawn-700 hover:text-lawn-800">Return to Lawn Pro</Link>
        </section>
      </main>
    )
  }

  if (!adminKey) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-b from-lawn-50 to-white px-4 py-12">
        <section className="w-full max-w-md rounded-3xl border border-lawn-100 bg-white p-8 shadow-xl">
          <div className="flex items-center gap-2 text-xl font-bold text-lawn-700"><Sprout /> Lawn Pro</div>
          <h1 className="mt-8 text-3xl font-bold text-gray-900">Vendor applications</h1>
          <p className="mt-2 text-gray-600">Enter the private admin passcode to review applications.</p>
          {state.status === 'error' && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{state.message}</div>}
          <form onSubmit={signIn} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Admin passcode<input type="password" required value={draftKey} onChange={event => setDraftKey(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="current-password" /></label>
            <button className="btn-primary w-full" type="submit">Open application queue</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-lawn-700"><Sprout /> Lawn Pro Admin</Link>
          <button type="button" onClick={signOut} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><LogOut size={17} /> Sign out</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-lawn-700">Provider onboarding</p><h1 className="mt-1 text-3xl font-bold">Vendor applications</h1><p className="mt-2 text-gray-600">Review each applicant before granting vendor access.</p></div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-amber-900"><span className="text-2xl font-bold">{counts.PENDING}</span><span className="ml-2 text-sm font-semibold">pending</span></div>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Application status filters">
          {filters.map(item => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === item ? 'bg-lawn-700 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:border-lawn-400'}`}>{item.charAt(0) + item.slice(1).toLowerCase()}</button>)}
        </div>

        {state.status === 'error' && <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"><AlertCircle className="shrink-0" />{state.message}</div>}
        {state.status === 'loading' && <div className="mt-16 flex items-center justify-center gap-3 text-gray-600"><Loader2 className="animate-spin" /> Loading applications…</div>}
        {state.status === 'ready' && applications.length === 0 && <div className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center"><Clock3 className="mx-auto h-10 w-10 text-gray-400" /><h2 className="mt-4 text-xl font-bold">No {filter.toLowerCase()} applications</h2><p className="mt-2 text-gray-600">New applications will appear here automatically.</p></div>}

        <div className="mt-6 grid gap-5">
          {applications.map(application => (
            <article key={application.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold">{application.name}</h2><span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[application.status]}`}>{application.status}</span></div><p className="mt-1 text-gray-600">{application.businessName || 'Independent provider'}</p></div>
                <time className="text-sm text-gray-500" dateTime={application.createdAt}>{new Date(application.createdAt).toLocaleString()}</time>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
                <a className="flex items-center gap-2 hover:text-lawn-700" href={`mailto:${application.email}`}><Mail size={17} />{application.email}</a>
                <a className="flex items-center gap-2 hover:text-lawn-700" href={`tel:${application.phone}`}><Phone size={17} />{application.phone}</a>
                <span className="flex items-center gap-2"><MapPin size={17} />ZIP {application.zipCode}</span>
              </div>

              <dl className="mt-6 grid gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2">
                <div><dt className="text-sm font-semibold text-gray-500">Services</dt><dd className="mt-1 text-gray-900">{application.services.join(', ')}</dd></div>
                <div><dt className="text-sm font-semibold text-gray-500">Experience</dt><dd className="mt-1 text-gray-900">{application.experience || 'Not provided'}</dd></div>
                <div><dt className="text-sm font-semibold text-gray-500">Availability</dt><dd className="mt-1 whitespace-pre-wrap text-gray-900">{application.availability || 'Not provided'}</dd></div>
                <div><dt className="text-sm font-semibold text-gray-500">Insurance</dt><dd className="mt-1 text-gray-900">{application.insured ? 'Applicant reports active insurance' : 'Proof may still be required'}</dd></div>
                {application.notes && <div className="sm:col-span-2"><dt className="text-sm font-semibold text-gray-500">Notes</dt><dd className="mt-1 whitespace-pre-wrap text-gray-900">{application.notes}</dd></div>}
              </dl>

              {application.status === 'PENDING' && <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5"><button type="button" disabled={updatingId === application.id} onClick={() => review(application.id, 'APPROVED')} className="inline-flex items-center gap-2 rounded-lg bg-lawn-600 px-5 py-2.5 font-semibold text-white hover:bg-lawn-700 disabled:opacity-60"><Check size={18} /> Approve</button><button type="button" disabled={updatingId === application.id} onClick={() => review(application.id, 'REJECTED')} className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-5 py-2.5 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"><X size={18} /> Reject</button>{updatingId === application.id && <span className="inline-flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</span>}</div>}
              {application.status === 'APPROVED' && <div className="mt-6 flex items-center gap-2 border-t border-gray-100 pt-5 font-semibold text-lawn-700"><BadgeCheck /> Approved for onboarding</div>}
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

export default AdminVendorApplications
