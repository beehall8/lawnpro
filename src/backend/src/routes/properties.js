import express from 'express'
import { z } from 'zod'

const router = express.Router()

// In-memory property store (replace with Prisma in production)
const properties = []

// Validation schema
const propertySchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(5),
  lawnSqFt: z.number().optional(),
  requestEstimate: z.boolean().optional()
})

// Create property
router.post('/', async (req, res) => {
  try {
    const { street, city, state, zip, lawnSqFt, requestEstimate } = propertySchema.parse(req.body)
    
    // Mock satellite estimate if requested
    let estimatedSqFt = lawnSqFt
    if (requestEstimate && !lawnSqFt) {
      // In production, call Google Maps API here
      estimatedSqFt = Math.floor(Math.random() * 8000) + 2000 // Mock: 2000-10000 sq ft
    }
    
    const property = {
      id: properties.length + 1,
      street,
      city,
      state,
      zip,
      latitude: 30.2672, // Austin, TX mock coordinates
      longitude: -97.7431,
      estimatedLawnSqFt: estimatedSqFt,
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
