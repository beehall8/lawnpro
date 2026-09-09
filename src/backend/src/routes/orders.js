import express from 'express'
import { z } from 'zod'

const router = express.Router()

// In-memory order store (replace with Prisma in production)
const orders = []

// Validation schema
const orderSchema = z.object({
  propertyId: z.number(),
  serviceType: z.string(),
  frequency: z.enum(['onetime', 'weekly', 'biweekly', 'monthly']),
  scheduledDate: z.string().optional(),
  timeWindowStart: z.string().optional(),
  specialInstructions: z.string().optional()
})

// Create order
router.post('/', async (req, res) => {
  try {
    const { propertyId, serviceType, frequency, scheduledDate, timeWindowStart, specialInstructions } = orderSchema.parse(req.body)
    
    // Mock pricing
    const basePrices = { mowing: 35, trimming: 25, edging: 20, fertilizing: 45 }
    const basePrice = basePrices[serviceType.toLowerCase()] || 35
    const frequencyDiscounts = { onetime: 1, biweekly: 0.9, weekly: 0.85, monthly: 0.95 }
    
    const subtotal = Math.round(basePrice * (frequencyDiscounts[frequency] || 1) * 100)
    const platformFee = Math.round(subtotal * 0.2)
    const vendorPayout = Math.round(subtotal * 0.8)
    const total = subtotal + platformFee
    
    const order = {
      id: orders.length + 1,
      propertyId,
      serviceType,
      frequency,
      scheduledDate,
      timeWindowStart,
      specialInstructions,
      status: 'pending',
      subtotalCents: subtotal,
      platformFeeCents: platformFee,
      vendorPayoutCents: vendorPayout,
      totalCents: total,
      createdAt: new Date()
    }
    
    orders.push(order)
    
    res.status(201).json({
      success: true,
      data: order
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors[0].message })
    }
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

// Get all orders
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: orders
  })
})

// Get order by ID
router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id))
  
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }
  
  res.json({
    success: true,
    data: order
  })
})

export default router
