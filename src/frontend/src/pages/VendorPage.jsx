import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Briefcase, CalendarCheck, CheckCircle2, DollarSign, MapPin, ShieldCheck, Sprout } from 'lucide-react'

const services = ['Mowing', 'Trimming', 'Edging', 'Leaf removal', 'Fertilizing', 'Weed control']

const initialApplication = {
  name: '',
  business: '',
  email: '',
  phone: '',
  zip: '',
  experience: '',
  availability: '',
  notes: '',
  insured: false,
  agreed: false,
  services: [],
}

function VendorPage() {
  const [application, setApplication] = useState(initialApplication)
  const [submitted, setSubmitted] = useState(false)

  const updateField = (field, value) => {
    setSubmitted(false)
    setApplication(current => ({ ...current, [field]: value }))
  }

  const toggleService = (service) => {
    setSubmitted(false)
    setApplication(current => ({
      ...current,
      services: current.services.includes(service)
        ? current.services.filter(item => item !== service)
        : [...current.services, service],
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const body = [
      `Name: ${application.name}`,
      `Business: ${application.business || 'Not provided'}`,
      `Email: ${application.email}`,
      `Phone: ${application.phone}`,
      `ZIP code: ${application.zip}`,
      `Years of experience: ${application.experience || 'Not provided'}`,
      `Services: ${application.services.join(', ') || 'Not selected'}`,
      `Availability: ${application.availability || 'Not provided'}`,
      `Insured: ${application.insured ? 'Yes' : 'No'}`,
      '',
      'Notes:',
      application.notes || 'None',
    ].join('\n')

    window.location.href = `mailto:support@lawnproatl.com?subject=${encodeURIComponent(`Vendor application from ${application.name}`)}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
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
              <div><h2 className="text-3xl font-bold text-lawn-800">Apply to become a Lawn Pro</h2><p className="mt-2 text-gray-600">Complete this form to prepare an application email for our team.</p></div>
            </div>

            {submitted && <div role="status" className="mt-6 rounded-xl border border-lawn-200 bg-lawn-50 p-4 text-lawn-800">Your email app has opened with your application ready to send to support@lawnproatl.com. Send the email to complete your application.</div>}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-5">
                <label className="block text-sm font-semibold text-gray-700">Your name<input required value={application.name} onChange={event => updateField('name', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="name" /></label>
                <label className="block text-sm font-semibold text-gray-700">Business name <span className="font-normal text-gray-500">(optional)</span><input value={application.business} onChange={event => updateField('business', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="organization" /></label>
                <label className="block text-sm font-semibold text-gray-700">Email address<input required type="email" value={application.email} onChange={event => updateField('email', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="email" /></label>
                <label className="block text-sm font-semibold text-gray-700">Phone number<input required type="tel" value={application.phone} onChange={event => updateField('phone', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" autoComplete="tel" /></label>
                <label className="block text-sm font-semibold text-gray-700">Primary ZIP code<input required inputMode="numeric" pattern="[0-9]{5}" value={application.zip} onChange={event => updateField('zip', event.target.value.replace(/\D/g, '').slice(0, 5))} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" placeholder="30083" /></label>
                <label className="block text-sm font-semibold text-gray-700">Years of experience<select value={application.experience} onChange={event => updateField('experience', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100"><option value="">Select one</option><option>Less than 1 year</option><option>1–2 years</option><option>3–5 years</option><option>6+ years</option></select></label>
              </div>

              <fieldset><legend className="text-sm font-semibold text-gray-700">Services you offer</legend><div className="mt-3 grid sm:grid-cols-2 gap-3">{services.map(service => <label key={service} className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-lawn-400"><input type="checkbox" checked={application.services.includes(service)} onChange={() => toggleService(service)} className="h-4 w-4 accent-lawn-600" />{service}</label>)}</div></fieldset>

              <label className="block text-sm font-semibold text-gray-700">When are you usually available?<textarea rows="3" value={application.availability} onChange={event => updateField('availability', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" placeholder="For example: weekdays after 9 AM and Saturday mornings" /></label>
              <label className="block text-sm font-semibold text-gray-700">Anything else we should know? <span className="font-normal text-gray-500">(optional)</span><textarea rows="4" value={application.notes} onChange={event => updateField('notes', event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" placeholder="Equipment, service area, certifications, or other details" /></label>
              <label className="flex gap-3 text-sm text-gray-700"><input type="checkbox" checked={application.insured} onChange={event => updateField('insured', event.target.checked)} className="mt-0.5 h-4 w-4 accent-lawn-600" />I have active business insurance, or I understand proof of insurance may be required before approval.</label>
              <label className="flex gap-3 text-sm text-gray-700"><input required type="checkbox" checked={application.agreed} onChange={event => updateField('agreed', event.target.checked)} className="mt-0.5 h-4 w-4 accent-lawn-600" />I confirm the information in this application is accurate and agree to be contacted about becoming a Lawn Pro provider.</label>
              <button type="submit" className="btn-primary w-full py-3">Prepare application email</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

export default VendorPage
