import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, BadgeCheck, Check, Clock3, Loader2, LogOut, Mail, MapPin, Phone, Sprout, X } from 'lucide-react'
import { createUserWithEmailAndPassword, onAuthStateChanged, reload, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'

const ADMIN_EMAIL = 'cliquebots@gmail.com'
const filters = ['PENDING', 'APPROVED', 'REJECTED', 'ALL']
const statusStyles = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  APPROVED: 'border-lawn-200 bg-lawn-50 text-lawn-800',
  REJECTED: 'border-red-200 bg-red-50 text-red-800',
}

const authMessage = error => {
  if (error?.code === 'auth/email-already-in-use') return 'This admin account already exists. Choose Sign in instead.'
  if (error?.code === 'auth/invalid-credential') return 'Invalid email or password.'
  if (error?.code === 'auth/weak-password') return 'Choose a password with at least 8 characters.'
  if (error?.code === 'permission-denied') return 'This account does not have permission to review applications.'
  return error?.message || 'The request could not be completed.'
}

const formatDate = timestamp => {
  const date = timestamp?.toDate?.() || (timestamp ? new Date(timestamp) : null)
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : 'Just now'
}

function AdminVendorApplications() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [mode, setMode] = useState('signin')
  const [credentials, setCredentials] = useState({ email: ADMIN_EMAIL, password: '' })
  const [filter, setFilter] = useState('PENDING')
  const [allApplications, setAllApplications] = useState([])
  const [state, setState] = useState({ status: 'idle', message: '' })
  const [updatingId, setUpdatingId] = useState('')

  const isVerifiedAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL && user.emailVerified

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthReady(true)
      setState({ status: 'error', message: 'The Firebase connection is not configured yet.' })
      return undefined
    }
    return onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
      setAuthReady(true)
      if (currentUser && !currentUser.emailVerified) {
        setState({ status: 'verify', message: 'Verify the admin email before opening the application queue.' })
      }
    })
  }, [])

  useEffect(() => {
    if (!isVerifiedAdmin) return undefined
    setState({ status: 'loading', message: '' })
    const applicationsQuery = query(collection(db, 'vendorApplications'), orderBy('createdAt', 'desc'))
    return onSnapshot(applicationsQuery, snapshot => {
      setAllApplications(snapshot.docs.map(item => ({ id: item.id, ...item.data() })))
      setState({ status: 'ready', message: '' })
    }, error => setState({ status: 'error', message: authMessage(error) }))
  }, [isVerifiedAdmin])

  const applications = useMemo(
    () => filter === 'ALL' ? allApplications : allApplications.filter(item => item.status === filter),
    [allApplications, filter],
  )

  const counts = useMemo(() => allApplications.reduce((result, item) => {
    if (result[item.status] !== undefined) result[item.status] += 1
    return result
  }, { PENDING: 0, APPROVED: 0, REJECTED: 0 }), [allApplications])

  const submitCredentials = async event => {
    event.preventDefault()
    if (!isFirebaseConfigured) return
    setState({ status: 'loading', message: '' })
    const email = credentials.email.trim().toLowerCase()

    if (email !== ADMIN_EMAIL) {
      setState({ status: 'error', message: `Use the Firebase project owner email: ${ADMIN_EMAIL}` })
      return
    }

    try {
      if (mode === 'create') {
        const result = await createUserWithEmailAndPassword(auth, email, credentials.password)
        await sendEmailVerification(result.user, { url: 'https://lawnproatl.com/admin/vendors' })
        setUser(result.user)
        setState({ status: 'verify', message: `Verification sent to ${ADMIN_EMAIL}. Open the email, verify the account, then return here.` })
      } else {
        await signInWithEmailAndPassword(auth, email, credentials.password)
      }
    } catch (error) {
      setState({ status: 'error', message: authMessage(error) })
    }
  }

  const checkVerification = async () => {
    if (!auth.currentUser) return
    setState({ status: 'loading', message: '' })
    await reload(auth.currentUser)
    await auth.currentUser.getIdToken(true)
    setUser({ email: auth.currentUser.email, emailVerified: auth.currentUser.emailVerified })
    setState(auth.currentUser.emailVerified
      ? { status: 'ready', message: '' }
      : { status: 'verify', message: 'The account is not verified yet. Open the verification email and try again.' })
  }

  const resendVerification = async () => {
    if (!auth.currentUser) return
    setState({ status: 'loading', message: '' })

    try {
      await sendEmailVerification(auth.currentUser, { url: 'https://lawnproatl.com/admin/vendors' })
      setState({ status: 'verify', message: `A new verification email was sent to ${auth.currentUser.email}. Check your inbox and spam folder.` })
    } catch (error) {
      setState({ status: 'error', message: authMessage(error) })
    }
  }

  const logOut = async () => {
    await signOut(auth)
    setAllApplications([])
    setState({ status: 'idle', message: '' })
  }

  const review = async (id, status) => {
    setUpdatingId(id)
    try {
      await updateDoc(doc(db, 'vendorApplications', id), { status, reviewedAt: serverTimestamp() })
    } catch (error) {
      setState({ status: 'error', message: authMessage(error) })
    } finally {
      setUpdatingId('')
    }
  }

  if (!authReady) return <div className="flex min-h-screen items-center justify-center gap-3 bg-gray-50 text-gray-600"><Loader2 className="animate-spin" /> Loading secure admin access…</div>

  if (!isVerifiedAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-b from-lawn-50 to-white px-4 py-12">
        <section className="w-full max-w-md rounded-3xl border border-lawn-100 bg-white p-8 shadow-xl">
          <div className="flex items-center gap-2 text-xl font-bold text-lawn-700"><Sprout /> Lawn Pro</div>
          <h1 className="mt-8 text-3xl font-bold text-gray-900">Vendor applications</h1>
          <p className="mt-2 text-gray-600">Sign in with the verified Firebase project owner account to review applications.</p>
          {state.message && <div role={state.status === 'error' ? 'alert' : 'status'} className={`mt-5 rounded-xl border p-4 ${state.status === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>{state.message}</div>}

          {user && !user.emailVerified ? (
            <div className="mt-7 space-y-3">
              <button type="button" onClick={checkVerification} className="btn-primary w-full">I verified my email</button>
              <button type="button" disabled={state.status === 'loading'} onClick={resendVerification} className="w-full rounded-lg border border-lawn-600 px-4 py-3 font-semibold text-lawn-700 hover:bg-lawn-50 disabled:cursor-not-allowed disabled:opacity-60">{state.status === 'loading' ? 'Sending verification email…' : 'Resend verification email'}</button>
              <button type="button" onClick={logOut} className="w-full rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700">Use another account</button>
            </div>
          ) : (
            <form onSubmit={submitCredentials} className="mt-7 space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Admin email<input type="email" required value={credentials.email} onChange={event => setCredentials(current => ({ ...current, email: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="email" /></label>
              <label className="block text-sm font-semibold text-gray-700">Password<input type="password" minLength="8" required value={credentials.password} onChange={event => setCredentials(current => ({ ...current, password: event.target.value }))} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} /></label>
              <button disabled={state.status === 'loading' || !isFirebaseConfigured} className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-60" type="submit">{state.status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}{mode === 'create' ? 'Create admin account' : 'Sign in'}</button>
              <button type="button" onClick={() => { setMode(current => current === 'signin' ? 'create' : 'signin'); setState({ status: 'idle', message: '' }) }} className="w-full text-sm font-semibold text-lawn-700">{mode === 'signin' ? 'First time? Create the admin account' : 'Already created it? Sign in'}</button>
            </form>
          )}
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-lawn-700"><Sprout /> Lawn Pro Admin</Link>
          <div className="flex items-center gap-3"><Link to="/admin/jobs" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Jobs & payouts</Link><button type="button" onClick={logOut} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><LogOut size={17} /> Sign out</button></div>
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
                <time className="text-sm text-gray-500">{formatDate(application.createdAt)}</time>
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
