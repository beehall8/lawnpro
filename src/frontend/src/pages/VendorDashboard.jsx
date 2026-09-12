import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Calendar, CheckCircle, Clock, DollarSign, Loader2, LogOut, MapPin, Sprout } from 'lucide-react'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { collection, doc, onSnapshot, query, runTransaction, serverTimestamp, where } from 'firebase/firestore'
import { auth, db } from '../firebase'

const formatMoneyRange = job => {
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0)
  if (job.estimateOpenEnded) return `${money(job.estimatedMin)} - Up`
  return job.estimatedMin === job.estimatedMax ? money(job.estimatedMin) : `${money(job.estimatedMin)}–${money(job.estimatedMax)}`
}

const formatDate = value => {
  if (!value) return 'Date not provided'
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

const sortJobs = jobs => [...jobs].sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || ''))

function JobCard({ job, accepted, accepting, onAccept }) {
  const fullAddress = [job.address?.street, job.address?.city, job.address?.state, job.address?.zip].filter(Boolean).join(', ')
  return <article className="card transition-shadow hover:shadow-lg">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-bold text-gray-900">{job.serviceNames?.join(' + ') || 'Lawn service'}</h3>
          {accepted && <span className="rounded-full bg-lawn-100 px-3 py-1 text-sm font-semibold text-lawn-800">Accepted</span>}
        </div>
        <p className="mt-2 flex items-start gap-2 text-gray-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{fullAddress}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
          <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(job.scheduledDate)}</span>
          <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{job.timeWindow}</span>
          <span className="flex items-center gap-2"><Sprout className="h-4 w-4" />{job.lawnSizeName || 'Lawn size pending'}{job.lawnSizeRange ? ` · ${job.lawnSizeRange} sq ft` : ''}</span>
        </div>
        {accepted && <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Customer:</strong> {job.customerName} · {job.customerPhone} · {job.customerEmail}
          {job.notes && <p className="mt-2"><strong>Instructions:</strong> {job.notes}</p>}
          {job.status === 'AWAITING_FINAL_PAYMENT' && <p className="mt-2 font-semibold text-amber-700">Finished photos submitted — Square invoice sent to customer.</p>}
        </div>}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-5 border-t pt-4 lg:block lg:min-w-44 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 lg:text-right">
        <div><p className="text-sm text-gray-500">Estimated job value</p><p className="text-2xl font-bold text-lawn-700">{formatMoneyRange(job)}</p></div>
        {!accepted && <button type="button" onClick={() => onAccept(job.id)} disabled={accepting} className="btn-primary mt-0 flex min-w-32 items-center justify-center gap-2 disabled:opacity-60 lg:mt-4 lg:w-full">
          {accepting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}{accepting ? 'Accepting…' : 'Accept job'}
        </button>}
        {accepted && job.status === 'ACCEPTED' && <Link to={`/vendor/complete/${job.id}`} className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2">Complete job</Link>}
      </div>
    </div>
  </article>
}

function VendorDashboard() {
  const navigate = useNavigate()
  const vendor = JSON.parse(sessionStorage.getItem('lawnProVendorProfile') || '{}')
  const [tab, setTab] = useState('available')
  const [availableJobs, setAvailableJobs] = useState([])
  const [assignedJobs, setAssignedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acceptingId, setAcceptingId] = useState('')

  useEffect(() => {
    if (!auth.currentUser) return undefined
    const availableQuery = query(collection(db, 'jobs'), where('status', '==', 'PENDING'))
    const assignedQuery = query(collection(db, 'jobs'), where('assignedVendorId', '==', auth.currentUser.uid))
    let availableReady = false
    let assignedReady = false
    const markReady = () => { if (availableReady && assignedReady) setLoading(false) }
    const handleError = () => {
      setError('Jobs could not be loaded. Refresh the page and try again.')
      setLoading(false)
    }
    const unsubscribeAvailable = onSnapshot(availableQuery, snapshot => {
      setAvailableJobs(snapshot.docs.map(item => ({ id: item.id, ...item.data() })))
      availableReady = true
      markReady()
    }, handleError)
    const unsubscribeAssigned = onSnapshot(assignedQuery, snapshot => {
      setAssignedJobs(snapshot.docs.map(item => ({ id: item.id, ...item.data() })))
      assignedReady = true
      markReady()
    }, handleError)
    return () => {
      unsubscribeAvailable()
      unsubscribeAssigned()
    }
  }, [])

  const displayedJobs = useMemo(() => sortJobs(tab === 'available' ? availableJobs : assignedJobs), [availableJobs, assignedJobs, tab])

  const acceptJob = async jobId => {
    if (!auth.currentUser) return
    setAcceptingId(jobId)
    setError('')
    try {
      await runTransaction(db, async transaction => {
        const reference = doc(db, 'jobs', jobId)
        const snapshot = await transaction.get(reference)
        if (!snapshot.exists() || snapshot.data().status !== 'PENDING' || snapshot.data().assignedVendorId) {
          throw new Error('already-accepted')
        }
        transaction.update(reference, {
          status: 'ACCEPTED',
          assignedVendorId: auth.currentUser.uid,
          acceptedAt: serverTimestamp(),
        })
      })
      setTab('assigned')
    } catch (acceptError) {
      setError(acceptError?.message === 'already-accepted'
        ? 'Another vendor accepted this job first. The available list has been refreshed.'
        : 'This job could not be accepted. Please try again.')
    } finally {
      setAcceptingId('')
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    sessionStorage.removeItem('lawnProVendorProfile')
    navigate('/vendor/login', { replace: true })
  }

  const acceptedValue = {
    estimatedMin: assignedJobs.reduce((sum, job) => sum + (job.estimatedMin || 0), 0),
    estimatedMax: assignedJobs.reduce((sum, job) => sum + (job.estimatedMax || 0), 0),
    estimateOpenEnded: assignedJobs.some(job => job.estimateOpenEnded),
  }

  return <div className="min-h-screen bg-gray-50">
    <nav className="bg-lawn-700 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold"><Sprout /> Lawn Pro</Link>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block"><div className="text-sm opacity-80">Signed in as</div><div className="font-semibold">{vendor.businessName || vendor.name || 'Lawn Pro Vendor'}</div></div>
          <button onClick={signOut} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-lawn-700 hover:bg-gray-100"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </div>
    </nav>

    <main className="mx-auto max-w-7xl px-4 py-8">
      <div><p className="text-sm font-bold uppercase tracking-wider text-lawn-700">Job marketplace</p><h1 className="mt-1 text-3xl font-bold text-gray-900">Vendor dashboard</h1><p className="mt-2 text-gray-600">Claim available work and manage the jobs assigned to you.</p></div>

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4"><Clock className="h-9 w-9 text-amber-600" /><div><p className="text-2xl font-bold">{availableJobs.length}</p><p className="text-sm text-gray-600">Available jobs</p></div></div>
        <div className="card flex items-center gap-4"><Briefcase className="h-9 w-9 text-lawn-600" /><div><p className="text-2xl font-bold">{assignedJobs.length}</p><p className="text-sm text-gray-600">My accepted jobs</p></div></div>
        <div className="card flex items-center gap-4"><DollarSign className="h-9 w-9 text-blue-600" /><div><p className="text-2xl font-bold">{assignedJobs.length ? formatMoneyRange(acceptedValue) : '$0'}</p><p className="text-sm text-gray-600">Accepted job value</p></div></div>
      </section>

      <div className="mt-8 flex gap-2 border-b border-gray-200" role="tablist" aria-label="Vendor jobs">
        <button role="tab" aria-selected={tab === 'available'} onClick={() => setTab('available')} className={`border-b-2 px-4 py-3 font-semibold ${tab === 'available' ? 'border-lawn-600 text-lawn-700' : 'border-transparent text-gray-600'}`}>Available jobs ({availableJobs.length})</button>
        <button role="tab" aria-selected={tab === 'assigned'} onClick={() => setTab('assigned')} className={`border-b-2 px-4 py-3 font-semibold ${tab === 'assigned' ? 'border-lawn-600 text-lawn-700' : 'border-transparent text-gray-600'}`}>My jobs ({assignedJobs.length})</button>
      </div>

      {error && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}
      {loading ? <div className="flex items-center justify-center gap-3 py-20 text-gray-600"><Loader2 className="animate-spin" />Loading jobs…</div> : displayedJobs.length ? <div className="mt-6 space-y-4">
        {displayedJobs.map(job => <JobCard key={job.id} job={job} accepted={tab === 'assigned'} accepting={acceptingId === job.id} onAccept={acceptJob} />)}
      </div> : <section className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-bold text-gray-800">{tab === 'available' ? 'No jobs are available right now' : 'You have not accepted a job yet'}</h2>
        <p className="mt-2 text-gray-600">{tab === 'available' ? 'New customer requests will appear here automatically.' : 'Choose an available job and accept it to add it here.'}</p>
      </section>}
    </main>
  </div>
}

export default VendorDashboard
