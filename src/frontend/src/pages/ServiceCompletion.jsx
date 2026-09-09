import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Upload, Camera, CheckCircle, MapPin, DollarSign, User } from 'lucide-react'

function ServiceCompletion() {
  const { jobId } = useParams()
  const [beforePhoto, setBeforePhoto] = useState(null)
  const [afterPhoto, setAfterPhoto] = useState(null)
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  
  // Sample job data (would come from API in real app)
  const job = {
    id: jobId,
    address: '123 Oak Street, Austin, TX 78701',
    service: 'Mowing',
    customer: 'John D.',
    payout: 45,
    lawnSize: 5200
  }

  const handlePhotoUpload = (type, file) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      type === 'before' ? setBeforePhoto(reader.result) : setAfterPhoto(reader.result)
    }
    if (file) reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (beforePhoto && afterPhoto) {
      // In real app, would upload to server
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <CheckCircle className="w-20 h-20 mx-auto text-lawn-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Completed!</h2>
          <p className="text-gray-600 mb-6">
            Your photos and notes have been submitted. The customer will be notified and payment will be processed.
          </p>
          <div className="bg-lawn-50 rounded-lg p-4 mb-6">
            <div className="text-2xl font-bold text-lawn-700">${job.payout}</div>
            <div className="text-sm text-gray-600">Payout Amount</div>
          </div>
          <Link to="/vendor/dashboard" className="btn-primary w-full block text-center">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/vendor/dashboard" className="text-lawn-600 hover:text-lawn-700">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Job Info */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Complete Job #{job.id}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <MapPin className="text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Address</div>
                <div className="font-medium">{job.address}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Customer</div>
                <div className="font-medium">{job.customer}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Payout</div>
                <div className="font-medium text-lawn-600">${job.payout}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Before & After Photos</h3>
          <p className="text-gray-600 mb-6">
            Upload photos of the lawn before and after your work. This is required for payment processing.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Before Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-lawn-500 transition-colors">
                {beforePhoto ? (
                  <div className="relative">
                    <img src={beforePhoto} alt="Before" className="rounded-lg max-h-48 mx-auto" />
                    <button
                      onClick={() => setBeforePhoto(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <Upload size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload or take photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoUpload('before', e.target.files[0])}
                      className="hidden"
                      id="before-photo"
                    />
                    <label
                      htmlFor="before-photo"
                      className="btn-primary inline-block cursor-pointer"
                    >
                      Choose Photo
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* After Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">After Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-lawn-500 transition-colors">
                {afterPhoto ? (
                  <div className="relative">
                    <img src={afterPhoto} alt="After" className="rounded-lg max-h-48 mx-auto" />
                    <button
                      onClick={() => setAfterPhoto(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <Upload size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload or take photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoUpload('after', e.target.files[0])}
                      className="hidden"
                      id="after-photo"
                    />
                    <label
                      htmlFor="after-photo"
                      className="btn-primary inline-block cursor-pointer"
                    >
                      Choose Photo
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Completion Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lawn-500 focus:border-transparent"
            placeholder="Add any notes about the job completion, special circumstances, or issues encountered..."
          />
          <p className="text-sm text-gray-600 mt-2">
            Optional but recommended for dispute resolution
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!beforePhoto || !afterPhoto}
            className={`btn-primary px-8 py-3 flex items-center space-x-2 ${
              !beforePhoto || !afterPhoto ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <CheckCircle size={20} />
            <span>Submit Completion</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServiceCompletion
