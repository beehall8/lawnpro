import { useMemo } from 'react'
import { Calendar, CheckCircle, Clock, Leaf, MapPin, ReceiptText } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'

const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100)

function BookingConfirmation() {
  const { jobId } = useParams()
  const location = useLocation()
  const details = useMemo(() => {
    if (location.state) return location.state
    try {
      return JSON.parse(sessionStorage.getItem(`lawnProBooking:${jobId}`) || 'null')
    } catch {
      return null
    }
  }, [jobId, location.state])

  return <main className="min-h-screen bg-lawn-50 px-4 py-10">
    <div className="mx-auto max-w-2xl">
      <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-lawn-800"><Leaf /> LAWN PRO</Link>
      <section className="card mt-7">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-lawn-600" />
          <p className="mt-5 text-sm font-bold uppercase tracking-wider text-lawn-700">Payment confirmed</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Your lawn service is booked</h1>
          <p className="mt-3 text-gray-600">A Lawn Pro vendor can now accept your request. Keep this confirmation number for your records.</p>
        </div>

        <div className="mt-7 rounded-xl bg-gray-50 p-5">
          <div className="flex items-center gap-3"><ReceiptText className="h-5 w-5 text-lawn-700" /><div><p className="text-sm text-gray-500">Confirmation number</p><p className="break-all font-bold text-gray-900">{jobId}</p></div></div>
        </div>

        {details ? <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4"><p className="text-sm text-gray-500">Deposit paid today</p><p className="mt-1 text-2xl font-bold text-lawn-700">{money(details.depositCents)}</p></div>
            <div className="rounded-xl border border-gray-200 p-4"><p className="text-sm text-gray-500">Remaining after service</p><p className="mt-1 text-2xl font-bold text-gray-900">{money(details.balanceCents)}</p></div>
          </div>
          <div className="space-y-3 rounded-xl border border-gray-200 p-5 text-gray-700">
            <p className="flex gap-3"><Calendar className="h-5 w-5 shrink-0 text-lawn-700" /><span><strong>Service date:</strong> {details.scheduledDate}</span></p>
            <p className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-lawn-700" /><span><strong>Time window:</strong> {details.timeWindow}</span></p>
            <p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-lawn-700" /><span><strong>Address:</strong> {details.address}</span></p>
            <p><strong>Services:</strong> {details.services?.join(', ') || 'Lawn service'}</p>
          </div>
        </div> : <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Detailed booking information is available in the browser used to place the order. Your confirmation number remains valid.</p>}

        <div className="mt-7 rounded-xl bg-lawn-50 p-4 text-sm text-lawn-900"><strong>What happens next?</strong> An approved vendor will accept the job. After the work and finished photos are submitted, Square will email the remaining-balance invoice.</div>
        <Link to="/" className="btn-primary mt-7 inline-block w-full text-center">Return home</Link>
      </section>
    </div>
  </main>
}

export default BookingConfirmation
