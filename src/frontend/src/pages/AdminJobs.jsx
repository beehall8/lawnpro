import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Clock, DollarSign, Image, Loader2, LogOut, Sprout } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const ADMIN_UID = 'wMtrFLvsXUObDuRDMyKQcPqXvwD2'
const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100)
const statuses = ['ALL', 'PENDING', 'ACCEPTED', 'AWAITING_FINAL_PAYMENT', 'COMPLETED']

function AdminJobs() {
  const [access, setAccess] = useState('checking')
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState('')

  useEffect(() => onAuthStateChanged(auth, user => setAccess(user?.uid === ADMIN_UID ? 'approved' : 'denied')), [])

  useEffect(() => {
    if (access !== 'approved') return undefined
    return onSnapshot(collection(db, 'jobs'), snapshot => {
      setJobs(snapshot.docs.map(item => ({ id: item.id, ...item.data() })))
    }, () => setError('Jobs could not be loaded.'))
  }, [access])

  const displayed = useMemo(() => jobs
    .filter(job => filter === 'ALL' || job.status === filter)
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [filter, jobs])

  const markVendorPaid = async job => {
    setUpdating(job.id); setError('')
    try {
      await updateDoc(doc(db, 'jobs', job.id), { payoutStatus: 'PAID', payoutPaidAt: serverTimestamp() })
    } catch {
      setError('The payout status could not be updated. Confirm the latest Firestore rules are deployed.')
    } finally {
      setUpdating('')
    }
  }

  if (access === 'checking') return <div className="flex min-h-screen items-center justify-center gap-3"><Loader2 className="animate-spin" />Checking admin access…</div>
  if (access === 'denied') return <main className="grid min-h-screen place-items-center px-4"><section className="card max-w-md text-center"><h1 className="text-2xl font-bold">Admin access required</h1><p className="mt-3 text-gray-600">Sign in through the vendor approvals page first.</p><Link to="/admin/vendors" className="btn-primary mt-6 inline-block">Admin sign in</Link></section></main>

  return <div className="min-h-screen bg-gray-50">
    <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4"><Link to="/" className="flex items-center gap-2 text-xl font-bold text-lawn-700"><Sprout />Lawn Pro Admin</Link><button onClick={() => signOut(auth)} className="flex items-center gap-2 rounded-lg border px-4 py-2"><LogOut className="h-4 w-4" />Sign out</button></div></header>
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-lawn-700">Operations</p><h1 className="mt-1 text-3xl font-bold">Jobs, payments and payouts</h1><p className="mt-2 text-gray-600">Review completed photos, customer payments, and vendor payout status.</p></div><Link to="/admin/vendors" className="rounded-lg border bg-white px-4 py-2 font-semibold">Vendor applications</Link></div>
      <section className="mt-7 grid gap-4 sm:grid-cols-3"><div className="card flex gap-3"><Clock className="text-amber-600" /><div><p className="text-2xl font-bold">{jobs.filter(j => j.status === 'AWAITING_FINAL_PAYMENT').length}</p><p className="text-sm text-gray-600">Awaiting payment</p></div></div><div className="card flex gap-3"><CheckCircle className="text-lawn-600" /><div><p className="text-2xl font-bold">{jobs.filter(j => j.status === 'COMPLETED').length}</p><p className="text-sm text-gray-600">Completed</p></div></div><div className="card flex gap-3"><DollarSign className="text-blue-600" /><div><p className="text-2xl font-bold">{money(jobs.filter(j => j.payoutStatus === 'READY').reduce((sum, j) => sum + (j.payoutAmountCents || 0), 0))}</p><p className="text-sm text-gray-600">Ready for vendor payout</p></div></div></section>
      <div className="mt-8 flex gap-2 overflow-x-auto">{statuses.map(status => <button key={status} onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === status ? 'bg-lawn-700 text-white' : 'border bg-white'}`}>{status.replaceAll('_', ' ')}</button>)}</div>
      {error && <p className="mt-5 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
      <div className="mt-6 space-y-5">{displayed.map(job => <article key={job.id} className="card"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-xl font-bold">{job.serviceNames?.join(' + ') || 'Lawn service'}</h2><p className="mt-1 text-sm text-gray-600">{job.customerName} · {job.customerEmail}</p><p className="mt-1 text-sm text-gray-600">{[job.address?.street, job.address?.city, job.address?.state, job.address?.zip].filter(Boolean).join(', ')}</p></div><div className="text-right"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">{job.status?.replaceAll('_', ' ')}</span><p className="mt-3 font-bold">{money(job.pricing?.totalCents)}</p></div></div>
        <div className="mt-5 grid gap-3 border-t pt-4 text-sm sm:grid-cols-3"><div><p className="text-gray-500">Deposit paid</p><strong>{money(job.pricing?.depositCents)}</strong></div><div><p className="text-gray-500">Remaining balance</p><strong>{money(job.pricing?.balanceCents)}</strong></div><div><p className="text-gray-500">Vendor payout</p><strong>{money(job.payoutAmountCents || job.pricing?.serviceSubtotalCents)}</strong><p className="text-xs text-gray-500">{job.payoutStatus || 'NOT READY'}</p></div></div>
        {job.completion?.photoUrls?.length > 0 && <div className="mt-5"><p className="mb-3 flex items-center gap-2 font-semibold"><Image className="h-5 w-5" />Finished-job photos</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{job.completion.photoUrls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer"><img src={url} alt={`Finished job ${index + 1}`} className="h-32 w-full rounded-lg object-cover" /></a>)}</div>{job.completion.notes && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">{job.completion.notes}</p>}</div>}
        {job.status === 'COMPLETED' && job.payoutStatus === 'READY' && <button onClick={() => markVendorPaid(job)} disabled={updating === job.id} className="btn-primary mt-5 disabled:opacity-50">{updating === job.id ? 'Saving…' : `Mark vendor paid ${money(job.payoutAmountCents)}`}</button>}
        {job.payoutStatus === 'PAID' && <p className="mt-5 font-semibold text-lawn-700">Vendor payout recorded as paid.</p>}
      </article>)}</div>
      {!displayed.length && <div className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center text-gray-600">No jobs match this filter.</div>}
    </main>
  </div>
}

export default AdminJobs
