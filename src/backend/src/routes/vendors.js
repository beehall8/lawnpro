import express from 'express'

const router = express.Router()

// In-memory vendor store (replace with Prisma in production)
const vendors = []

// Sample jobs for demo
const availableJobs = [
  {
    id: 1,
    address: '123 Oak Street, Austin, TX 78701',
    service: 'Mowing',
    lawnSize: 5200,
    payoutCents: 4500,
    distance: 2.3,
    customerRating: 4.8,
    date: 'Today',
    timeWindowStart: '10:00',
    timeWindowEnd: '12:00'
  },
  {
    id: 2,
    address: '456 Maple Ave, Austin, TX 78704',
    service: 'Trimming + Edging',
    lawnSize: 3800,
    payoutCents: 5500,
    distance: 3.1,
    customerRating: 4.9,
    date: 'Today',
    timeWindowStart: '14:00',
    timeWindowEnd: '16:00'
  }
]

// Get available jobs
router.get('/jobs', (req, res) => {
  res.json({
    success: true,
    data: availableJobs
  })
})

// Accept job
router.post('/jobs/:id/accept', (req, res) => {
  const jobId = parseInt(req.params.id)
  const job = availableJobs.find(j => j.id === jobId)
  
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' })
  }
  
  res.json({
    success: true,
    message: 'Job accepted successfully',
    data: job
  })
})

// Decline job
router.post('/jobs/:id/decline', (req, res) => {
  const jobId = parseInt(req.params.id)
  
  res.json({
    success: true,
    message: 'Job declined'
  })
})

// Get vendor earnings
router.get('/earnings', (req, res) => {
  res.json({
    success: true,
    data: {
      weeklyEarnings: 45000, // cents
      jobsCompleted: 12,
      avgRating: 4.8,
      pendingPayout: 8500
    }
  })
})

export default router
