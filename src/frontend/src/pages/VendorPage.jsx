import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, BadgeCheck, Briefcase, CalendarCheck, CheckCircle2, DollarSign, Loader2, MapPin, ShieldCheck, Sprout } from 'lucide-react'
import { createUserWithEmailAndPassword, deleteUser, signOut, updateProfile } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'

const services = ['Mowing', 'Trimming', 'Edging', 'Leaf removal', 'Fertilizing', 'Weed control']

const initialApplication = {
  name: '',
  business: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  zip: '',
  experience: '',
  availability: '',
  notes: '',
  insured: false,
  agreed: false,
  services: [],
}

const emailEndpoint = 'https://formsubmit.co/ajax/support@lawnproatl.com'

const friendlyError = error => {
  if (error?.code === 'auth/email-already-in-use') return 'An application account already exists for this email. Sign in to check its status.'
  if (error?.code === 'auth/weak-password') return 'Choose a password with at least 8 characters.'
  if (error?.code === 'auth/invalid-email') return 'Enter a valid email address.'
  if (error?.code === 'permission-denied') return 'The application could not be saved securely. Please contact support.'
  return error?.message || 'We could not submit your application. Please try again.'
}

function VendorPage() {
  const [application, setApplication] = useState(initialApplication)
  const [submission, setSubmission] = useState({ status: 'idle', message: '' })

  const updateField = (field, value) => {
    setSubmission({ status: 'idle', message: '' })
    setApplication(current => ({ ...current, [field]: value }))
  }

  const toggleService = (service) => {
    setSubmission({ status: 'idle', message: '' })
    setApplication(current => ({
      ...current,
      services: current.services.includes(service)
        ? current.services.filter(item => item !== service)
        : [...current.services, service],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (application.services.length === 0) {
      setSubmission({ status: 'error', message: 'Select at least one service you offer.' })
      return
    }
    if (application.password !== application.confirmPassword) {
      setSubmission({ status: 'error', message: 'The vendor sign-in passwords do not match.' })
      return
    }
    if (!isFirebaseConfigured) {
      setSubmission({ status: 'error', message: 'The application system is being connected. Please try again shortly.' })
      return
    }

    setSubmission({ status: 'sending', message: '' })

    const formData = new FormData()
    formData.append('_subject', `New Lawn Pro application: ${application.name}`)
    formData.append('_template', 'table')
    formData.append('_captcha', 'false')
    formData.append('_autoresponse', 'Thanks for applying to become a Lawn Pro. We received your application and will contact you after it has been reviewed.')
    formData.append('Name', application.name.trim())
    formData.append('Business', application.business.trim() || 'Not provided')
    formData.append('Email', application.email.trim())
    formData.append('Phone', application.phone.trim())
    formData.append('Primary ZIP code', application.zip)
    formData.append('Years of experience', application.experience || 'Not provided')
    formData.append('Services', application.services.join(', '))
    formData.append('Availability', application.availability.trim() || 'Not provided')
    formData.append('Business insurance', application.insured ? 'Yes' : 'No')
    formData.append('Notes', application.notes.trim() || 'None')

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        application.email.trim().toLowerCase(),
        application.password,
      )

      try {
        await updateProfile(credential.user, { displayName: application.name.trim() })
        await setDoc(doc(db, 'vendorApplications', credential.user.uid), {
          userId: credential.user.uid,
          name: application.name.trim(),
          businessName: application.business.trim() || null,
          email: application.email.trim().toLowerCase(),
          phone: application.phone.trim(),
          zipCode: application.zip,
          experience: application.experience || null,
          services: application.services,
          availability: application.availability.trim() || null,
          notes: application.notes.trim() || null,
          insured: application.insured,
          agreed: application.agreed,
          status: 'PENDING',
          createdAt: serverTimestamp(),
          reviewedAt: null,
        })
      } catch (error) {
        await deleteUser(credential.user).catch(() => undefined)
        throw error
      }

      await signOut(auth)

      try {
        const response = await fetch(emailEndpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        })
        const result = await response.json().catch(() => null)
        if (!response.ok || result?.success === false || result?.success === 'false') {
          console.warn('Application saved, but the notification email was not delivered.', result)
        }
      } catch (notificationError) {
        console.warn('Application saved, but the notification email was not delivered.', notificationError)
      }

      setApplication(initialApplication)
      setSubmission({
        status: 'success',
        message: 'Application received. Our team will review it and contact you about the next steps.',
      })
    } catch (error) {
      setSubmission({
        status: 'error',
        message: friendlyError(error),
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lawn-50 via-white to-white text-gray-900">
      <nav className="bg-white/95 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lawn-700 text-xl"><Sprout aria-hidden="true" /> Lawn Pro</Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-lawn-700">Home</Link>
            <a href="#apply" className="btn-primary text-sm">Apply now</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-[1.15fr_.85fr] gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-lawn-100 px-4 py-2 text-sm font-semibold text-lawn-800"><MapPin size={16} /> Now serving Stone Mountain, Conyers & Covington</span>
            <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-lawn-800">Grow your lawn care business with Lawn Pro.</h1>
            <p className="mt-5 max-w-2xl text-lg text-gray-600">Join local professionals who want a simpler way to find mowing and outdoor-care jobs in the communities they serve.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#apply" className="btn-primary px-6 py-3">Start your application</a>
              <Link to="/vendor/dashboard" className="rounded-lg border border-lawn-600 px-6 py-3 font-semibold text-lawn-700 hover:bg-lawn-50">Vendor portal</Link>
            </div>
            <div className="mt-10 grid sm:grid-cols-3 gap-5 text-sm">
              <div className="flex gap-3"><Briefcase className="text-lawn-600 shrink-0" /><span><strong className="block">Choose jobs</strong>Work that fits your schedule.</span></div>
              <div className="flex gap-3"><DollarSign className="text-lawn-600 shrink-0" /><span><strong className="block">See payouts</strong>Review earnings before you accept.</span></div>
              <div className="flex gap-3"><CalendarCheck className="text-lawn-600 shrink-0" /><span><strong className="block">Work locally</strong>Focus on your service area.</span></div>
            </div>
          </div>
          <aside className="rounded-3xl bg-lawn-700 p-8 text-white shadow-xl">
            <BadgeCheck className="w-11 h-11 text-lawn-200" />
            <h2 className="mt-5 text-2xl font-bold">Built for local pros</h2>
            <ul className="mt-6 space-y-4 text-lawn-50">
              {['Pick jobs that match your services and availability', 'Upload before-and-after photos from your phone', 'Keep track of completed work and payouts'].map(item => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 w-5 h-5 text-lawn-200 shrink-0" />{item}</li>)}
            </ul>
            <p className="mt-8 border-t border-lawn-500 pt-5 text-sm text-lawn-100">Applications are reviewed before a provider can accept customer jobs.</p>
          </aside>
        </section>

        <section className="bg-lawn-50 py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-lawn-800">How it works</h2>
            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {[
                ['1', 'Apply', 'Tell us about your business, services, and service area.'],
                ['2', 'Get approved', 'We review your application and contact you about next steps.'],
                ['3', 'Start earning', 'Use the vendor portal to find and complete local jobs.'],
              ].map(([number, title, description]) => <article key={number} className="rounded-2xl bg-white p-6 shadow-sm"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lawn-700 font-bold text-white">{number}</span><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mt-2 text-gray-600">{description}</p></article>)}
            </div>
          </div>
        </section>

        <section id="apply" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
          <div className="rounded-3xl border border-lawn-100 bg-white p-6 sm:p-10 shadow-lg">
            <div className="flex gap-4">
              <ShieldCheck className="mt-1 text-lawn-600 shrink-0" />
              <div><h2 className="text-3xl font-bold text-lawn-800">Apply to become a Lawn Pro</h2><p className="mt-2 text-gray-600">Complete the form and our team will review your application.</p></div>
            </div>

            {submission.status === 'success' && <div role="status" className="mt-6 flex gap-3 rounded-xl border border-lawn-200 bg-lawn-50 p-4 text-lawn-800"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><span>{submission.message}</span></div>}
            {submission.status === 'error' && <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><span>{submission.message}</span></div>}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-5">
                <label className="block text-sm font-semibold text-gray-700">Your name<input required value={application.name} onChange={event => updateField('name', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="name" /></label>
                <label className="block text-sm font-semibold text-gray-700">Business name <span className="font-normal text-gray-500">(optional)</span><input value={application.business} onChange={event => updateField('business', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="organization" /></label>
                <label className="block text-sm font-semibold text-gray-700">Email address<input required type="email" value={application.email} onChange={event => updateField('email', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="email" /></label>
                <label className="block text-sm font-semibold text-gray-700">Phone number<input required type="tel" value={application.phone} onChange={event => updateField('phone', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="tel" /></label>
                <label className="block text-sm font-semibold text-gray-700">Primary ZIP code<input required inputMode="numeric" pattern="[0-9]{5}" value={application.zip} onChange={event => updateField('zip', event.target.value.replace(/\D/g, '').slice(0, 5))} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" placeholder="30083" /></label>
                <label className="block text-sm font-semibold text-gray-700">Years of experience<select value={application.experience} onChange={event => updateField('experience', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100"><option value="">Select one</option><option>Less than 1 year</option><option>1–2 years</option><option>3–5 years</option><option>6+ years</option></select></label>
              </div>

              <div className="grid gap-5 rounded-2xl border border-lawn-100 bg-lawn-50 p-5 sm:grid-cols-2"><div className="sm:col-span-2"><h3 className="font-bold text-lawn-800">Create your vendor sign-in</h3><p className="mt-1 text-sm text-gray-600">You can sign in to the vendor portal after your application is approved.</p></div><label className="block text-sm font-semibold text-gray-700">Password<input required type="password" minLength="8" value={application.password} onChange={event => updateField('password', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="new-password" /></label><label className="block text-sm font-semibold text-gray-700">Confirm password<input required type="password" minLength="8" value={application.confirmPassword} onChange={event => updateField('confirmPassword', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="new-password" /></label>{application.confirmPassword && application.password !== application.confirmPassword && <p className="text-sm font-semibold text-red-700 sm:col-span-2">Passwords do not match.</p>}</div>

              <fieldset><legend className="text-sm font-semibold text-gray-700">Services you offer <span className="text-red-600" aria-hidden="true">*</span></legend><div className="mt-3 grid sm:grid-cols-2 gap-3">{services.map(service => <label key={service} className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-lawn-400"><input type="checkbox" checked={application.services.includes(service)} onChange={() => toggleService(service)} className="h-4 w-4 accent-lawn-600" />{service}</label>)}</div></fieldset>

              <label className="block text-sm font-semibold text-gray-700">When are you usually available?<textarea rows="3" value={application.availability} onChange={event => updateField('availability', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" placeholder="For example: weekdays after 9 AM and Saturday mornings" /></label>
              <label className="block text-sm font-semibold text-gray-700">Anything else we should know? <span className="font-normal text-gray-500">(optional)</span><textarea rows="4" value={application.notes} onChange={event => updateField('notes', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" placeholder="Equipment, service area, certifications, or other details" /></label>
              <label className="flex gap-3 text-sm text-gray-700"><input type="checkbox" checked={application.insured} onChange={event => updateField('insured', event.target.checked)} className="mt-0.5 h-4 w-4 accent-lawn-600" />I have active business insurance, or I understand proof of insurance may be required before approval.</label>
              <label className="flex gap-3 text-sm text-gray-700"><input required type="checkbox" checked={application.agreed} onChange={event => updateField('agreed', event.target.checked)} className="mt-0.5 h-4 w-4 accent-lawn-600" />I confirm the information in this application is accurate and agree to be contacted about becoming a Lawn Pro provider.</label>
              <button type="submit" disabled={submission.status === 'sending' || !isFirebaseConfigured} className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-70">
                {submission.status === 'sending' && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                {submission.status === 'sending' ? 'Submitting application…' : 'Submit application'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

export default VendorPage
