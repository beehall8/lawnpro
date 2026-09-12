import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Camera, CheckCircle, Loader2, MapPin, Upload, X } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { auth, db, functions, storage } from '../firebase'

const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100)

function ServiceCompletion() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [photos, setPhotos] = useState([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'jobs', jobId))
        if (!snapshot.exists()) throw new Error('This job was not found.')
        const data = snapshot.data()
        if (data.assignedVendorId !== auth.currentUser?.uid || data.status !== 'ACCEPTED') throw new Error('This job is not available to complete.')
        setJob({ id: snapshot.id, ...data })
      } catch (loadError) { setError(loadError.message || 'We could not load this job.') }
      finally { setLoading(false) }
    }
    load()
  }, [jobId])

  const addPhotos = event => {
    const valid = Array.from(event.target.files || []).filter(file => file.type.startsWith('image/')).slice(0, 6 - photos.length)
    setPhotos(current => [...current, ...valid.map(file => ({ file, preview: URL.createObjectURL(file) }))])
    event.target.value = ''
  }

  const completeJob = async () => {
    if (!photos.length || !job || submitting) return
    setSubmitting(true); setError('')
    try {
      const uploads = await Promise.all(photos.map(async ({ file }, index) => {
        const name = `${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
        const upload = await uploadBytes(ref(storage, `job-completions/${job.id}/${name}`), file, { contentType: file.type })
        return getDownloadURL(upload.ref)
      }))
      const requestFinalPayment = httpsCallable(functions, 'requestFinalPayment')
      await requestFinalPayment({ jobId: job.id, photoUrls: uploads, notes })
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError?.message || 'We could not complete this job. Please try again.')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center gap-3 bg-gray-50 text-gray-600"><Loader2 className="animate-spin" />Loading job…</div>
  if (submitted) return <main className="grid min-h-screen place-items-center bg-gray-50 px-4"><section className="card max-w-lg text-center"><CheckCircle className="mx-auto h-16 w-16 text-lawn-600" /><h1 className="mt-5 text-3xl font-bold">Job marked complete</h1><p className="mt-3 text-gray-600">The finished photos were saved and Square emailed the customer an invoice for the remaining {money(job.pricing?.balanceCents)}.</p><Link to="/vendor/dashboard" className="btn-primary mt-7 inline-block">Return to dashboard</Link></section></main>

  return <main className="min-h-screen bg-gray-50 px-4 py-8"><div className="mx-auto max-w-3xl"><Link to="/vendor/dashboard" className="text-lawn-700 hover:underline">← Back to dashboard</Link><section className="card mt-5"><h1 className="text-2xl font-bold">Complete job</h1>{job && <div className="mt-5 rounded-xl bg-gray-50 p-4"><p className="flex gap-2"><MapPin className="h-5 w-5 text-lawn-700" />{[job.address?.street, job.address?.city, job.address?.state, job.address?.zip].filter(Boolean).join(', ')}</p><p className="mt-2 text-sm text-gray-600">Customer: {job.customerName} · Remaining balance: <strong>{money(job.pricing?.balanceCents)}</strong></p></div>}<div className="mt-6"><h2 className="text-lg font-bold">Finished-job photos</h2><p className="mt-1 text-sm text-gray-600">Upload at least one photo. These are saved with the job before the customer receives the final Square invoice.</p><input id="completed-photos" type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={addPhotos} disabled={photos.length >= 6} /><label htmlFor="completed-photos" className="btn-primary mt-4 inline-flex cursor-pointer items-center gap-2"><Camera className="h-5 w-5" />Add photos</label>{photos.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{photos.map((photo, index) => <div key={photo.preview} className="relative"><img src={photo.preview} alt={`Finished job ${index + 1}`} className="h-32 w-full rounded-lg object-cover" /><button type="button" onClick={() => setPhotos(current => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-2 top-2 rounded-full bg-white p-1 text-gray-700 shadow"><X className="h-4 w-4" /></button></div>)}</div>}</div><label className="mt-6 block text-sm font-semibold">Completion notes <textarea value={notes} onChange={event => setNotes(event.target.value)} maxLength={1000} rows={4} className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-normal" placeholder="Optional notes for the customer" /></label>{error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}<button type="button" onClick={completeJob} disabled={!photos.length || submitting} className="btn-primary mt-6 flex items-center gap-2 disabled:opacity-50">{submitting ? <Loader2 className="animate-spin" /> : <Upload className="h-5 w-5" />}{submitting ? 'Saving photos and sending invoice…' : `Complete job and request ${money(job?.pricing?.balanceCents)}`}</button></section></div></main>
}

export default ServiceCompletion
