import express from 'express'
import { z } from 'zod'

const router = express.Router()

/**
 * Yard size estimation from a customer-drawn polygon.
 * Uses spherical polygon area (Google Maps geometry equivalent).
 * No ML, no computer vision.
 */

const EstimateSchema = z.object({
  address: z.string().min(3),
  polygon: z
    .array(z.object({ lat: z.number(), lng: z.number() }))
    .min(3, 'Polygon must have at least 3 points'),
})

// Spherical polygon area in square meters (matches google.maps.geometry.spherical.computeArea)
function sphericalPolygonAreaSqMeters(points) {
  const EARTH_RADIUS = 6378137 // meters
  const toRad = (d) => (d * Math.PI) / 180
  if (points.length < 3) return 0

  let total = 0
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % points.length]
    total +=
      (toRad(p2.lng) - toRad(p1.lng)) *
      (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)))
  }
  return Math.abs((total * EARTH_RADIUS * EARTH_RADIUS) / 2)
}

router.post('/estimate-size', (req, res) => {
  const parsed = EstimateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      details: parsed.error.flatten(),
    })
  }

  const { address, polygon } = parsed.data
  const sqMeters = sphericalPolygonAreaSqMeters(polygon)
  const areaSqFt = Math.round(sqMeters * 10.7639)
  const areaAcres = +(areaSqFt / 43560).toFixed(3)

  const centroid = polygon.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat / polygon.length, lng: acc.lng + p.lng / polygon.length }),
    { lat: 0, lng: 0 }
  )

  res.json({
    success: true,
    data: {
      address,
      coordinates: centroid,
      areaSqFt,
      areaAcres,
      source: 'customer_polygon',
      confidence: 'customer_confirmed',
    },
  })
})

export default router
