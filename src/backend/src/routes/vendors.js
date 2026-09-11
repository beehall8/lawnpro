import express from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../lib/prisma.js'

const router = express.Router()

const allowedServices = ['Mowing', 'Trimming', 'Edging', 'Leaf removal', 'Fertilizing', 'Weed control']

const applicationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  business: z.string().trim().max(160).optional().default(''),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(40),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
  zip: z.string().regex(/^\d{5}$/),
  experience: z.string().trim().max(80).optional().default(''),
  services: z.array(z.enum(allowedServices)).min(1),
  availability: z.string().trim().max(1000).optional().default(''),
  notes: z.string().trim().max(3000).optional().default(''),
  insured: z.boolean().default(false),
  agreed: z.literal(true),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
})

const vendorLoginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
})

const applicationSelect = {
  id: true,
  name: true,
  businessName: true,
  email: true,
  phone: true,
  zipCode: true,
  experience: true,
  services: true,
  availability: true,
  notes: true,
  insured: true,
  agreed: true,
  status: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
}

function safeKeyMatch(provided, expected) {
  if (!provided || !expected) return false
  const providedHash = crypto.createHash('sha256').update(provided).digest()
  const expectedHash = crypto.createHash('sha256').update(expected).digest()
  return crypto.timingSafeEqual(providedHash, expectedHash)
}

function requireAdmin(req, res, next) {
  if (!process.env.VENDOR_ADMIN_KEY) {
    return res.status(503).json({ success: false, error: 'Vendor administration is not configured' })
  }

  if (!safeKeyMatch(req.get('x-admin-key'), process.env.VENDOR_ADMIN_KEY)) {
    return res.status(401).json({ success: false, error: 'Invalid admin passcode' })
  }

  next()
}

function requireVendor(req, res, next) {
  const authorization = req.get('authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.role !== 'vendor') throw new Error('Invalid role')
    req.vendorApplicationId = payload.vendorApplicationId
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Vendor sign-in required' })
  }
}

// Submit a vendor application
router.post('/applications', async (req, res, next) => {
  try {
    const data = applicationSchema.parse(req.body)
    const existing = await prisma.vendorApplication.findFirst({
      where: { email: data.email.toLowerCase(), status: 'PENDING' },
      select: { id: true },
    })

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An application for this email address is already pending review.',
      })
    }

    const application = await prisma.vendorApplication.create({
      data: {
        name: data.name,
        businessName: data.business || null,
        email: data.email.toLowerCase(),
        phone: data.phone,
        passwordHash: await bcrypt.hash(data.password, 12),
        zipCode: data.zip,
        experience: data.experience || null,
        services: data.services,
        availability: data.availability || null,
        notes: data.notes || null,
        insured: data.insured,
        agreed: data.agreed,
      },
      select: { id: true, status: true, createdAt: true },
    })

    res.status(201).json({ success: true, data: application })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Please check the application details and try again.' })
    }
    next(error)
  }
})

// List applications for the private admin review page
router.get('/applications', requireAdmin, async (req, res, next) => {
  try {
    const requestedStatus = String(req.query.status || '').toUpperCase()
    const status = ['PENDING', 'APPROVED', 'REJECTED'].includes(requestedStatus)
      ? requestedStatus
      : undefined

    const [applications, groupedCounts] = await prisma.$transaction([
      prisma.vendorApplication.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
        select: applicationSelect,
      }),
      prisma.vendorApplication.groupBy({ by: ['status'], _count: { _all: true } }),
    ])
    const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0 }
    groupedCounts.forEach(item => { counts[item.status] = item._count._all })

    res.json({ success: true, data: applications, counts })
  } catch (error) {
    next(error)
  }
})

// Approve or reject an application
router.patch('/applications/:id', requireAdmin, async (req, res, next) => {
  try {
    const { status } = reviewSchema.parse(req.body)
    const application = await prisma.vendorApplication.update({
      where: { id: req.params.id },
      data: { status, reviewedAt: new Date() },
      select: applicationSelect,
    })

    res.json({ success: true, data: application })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Choose approve or reject.' })
    }
    if (error?.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Application not found' })
    }
    next(error)
  }
})

// Approved vendors can sign in to the vendor dashboard
router.post('/login', async (req, res, next) => {
  try {
    const data = vendorLoginSchema.parse(req.body)
    const application = await prisma.vendorApplication.findFirst({
      where: { email: data.email.toLowerCase() },
      orderBy: { createdAt: 'desc' },
    })

    if (!application || !(await bcrypt.compare(data.password, application.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }
    if (application.status !== 'APPROVED') {
      return res.status(403).json({ success: false, error: application.status === 'PENDING' ? 'Your application is still pending review.' : 'Your vendor application was not approved.' })
    }

    const accessToken = jwt.sign(
      { vendorApplicationId: application.id, email: application.email, role: 'vendor' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' },
    )

    res.json({
      success: true,
      data: {
        accessToken,
        vendor: { id: application.id, name: application.name, businessName: application.businessName, email: application.email },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Enter a valid email and password.' })
    }
    next(error)
  }
})

router.get('/me', requireVendor, async (req, res, next) => {
  try {
    const vendor = await prisma.vendorApplication.findFirst({
      where: { id: req.vendorApplicationId, status: 'APPROVED' },
      select: { id: true, name: true, businessName: true, email: true, services: true },
    })
    if (!vendor) return res.status(403).json({ success: false, error: 'Vendor access is not active' })
    res.json({ success: true, data: vendor })
  } catch (error) {
    next(error)
  }
})

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
