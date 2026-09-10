import express from 'express'
import { z } from 'zod'
import { validateAddress, estimateUnavailable } from '../../../shared/lawn-estimation.mjs'

const router = express.Router()

// In-memory property store (replace with Prisma in production)
const properties = []

// Validation schema
const propertySchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(5),
  lawnSqFt: z.number().finite().positive().max(1000000).optional(),
  requestEstimate: z.boolean().optional()
})

// Provider setup is pending. This endpoint never returns invented measurements.
router.post('/estimate', (req, res) => {
  const parsed = propertySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Enter a complete physical address.' })
  const error = validateAddress(parsed.data)
  if (error) return res.status(400).json({ success: false, error })
  return res.status(503).json(estimateUnavailable)
})

// Create property
router.post('/', async (req, res) => {
  try {
    const { street, city, state, zip, lawnSqFt, requestEstimate } = propertySchema.parse(req.body)
    
    const error = validateAddress({ street, city, state, zip })
    if (error) return res.status(400).json({ success: false, error })
    if (requestEstimate) return res.status(503).json(estimateUnavailable)

    const property = {
      id: properties.length + 1,
      street,
      city,
      state,
      zip,
      latitude: null,
      longitude: null,
      estimatedLawnSqFt: null,
      lawnSqFt: lawnSqFt ?? null,
      measurementSource: lawnSqFt ? 'customer' : 'unknown',
      verificationStatus: 'unverified',
      createdAt: new Date()
    }
    
    properties.push(property)
    
    res.status(201).json({
      success: true,
      data: property
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors[0].message })
    }
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

// Get all properties
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: properties
  })
})

// Get property by ID
router.get('/:id', (req, res) => {
  const property = properties.find(p => p.id === parseInt(req.params.id))
  
  if (!property) {
    return res.status(404).json({ success: false, error: 'Property not found' })
  }
  
  res.json({
    success: true,
    data: property
  })
})

export default router
