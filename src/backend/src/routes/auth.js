import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const router = express.Router()

// In-memory user store (replace with Prisma in production)
const users = []

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['customer', 'vendor'])
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = registerSchema.parse(req.body)
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' })
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)
    
    // Create user
    const user = {
      id: users.length + 1,
      email,
      password: passwordHash,
      firstName,
      lastName,
      role,
      createdAt: new Date()
    }
    
    users.push(user)
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      { expiresIn: '15m' }
    )
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
      { expiresIn: '7d' }
    )
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors[0].message })
    }
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    
    // Find user
    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      { expiresIn: '15m' }
    )
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
      { expiresIn: '7d' }
    )
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors[0].message })
    }
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

export default router
