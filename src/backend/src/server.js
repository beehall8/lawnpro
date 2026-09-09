import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import propertyRoutes from './routes/properties.js'
import orderRoutes from './routes/orders.js'
import vendorRoutes from './routes/vendors.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/properties', propertyRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/vendors', vendorRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({
    success: false,
    error: err.message
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  })
})

app.listen(PORT, () => {
  console.log(`🌱 Lawn Pro API running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

export default app
