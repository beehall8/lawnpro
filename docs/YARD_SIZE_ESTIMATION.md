# 🗺️ Yard Size Estimation

Simple, map-based lot/yard size measurement for quoting. **No computer vision, no ML.**

## Flow

```
Customer enters address
   ↓
Google Geocoding API → lat/lng
   ↓
Google Maps satellite view centered on property
   ↓
Customer draws polygon around their yard
(or accepts auto-suggested parcel outline if available)
   ↓
Google Maps Geometry Library computes area (sq ft)
   ↓
Display: "Estimated yard size: 5,240 sq ft"
   ↓
Customer confirms → quote generated
   ↓
Vendor verifies on first visit (optional adjustment)
```

## Why This Approach

- **Fast to build** (days, not weeks)
- **Cheap** ($5-10/mo at MVP volume vs $50-100/mo for CV)
- **Accurate enough** - customer-drawn polygons are ~95% accurate for quoting
- **No ML expertise needed**
- Room to add CV/grass detection later without changing the API contract

## APIs Used

| API | Purpose | Cost |
|---|---|---|
| Google Geocoding API | Address → lat/lng | $5 per 1,000 |
| Google Maps JavaScript API | Interactive satellite map + Drawing tools | $7 per 1,000 loads |
| Google Maps Geometry Library | `computeArea()` on polygon | Free (client-side) |

Est. cost at 1,000 quotes/mo: **~$12/mo**

## Backend Contract

### `POST /api/v1/properties/estimate-size`

**Request:**
```json
{
  "address": "123 Main St, Stone Mountain, GA 30087",
  "polygon": [
    { "lat": 33.8081, "lng": -84.1700 },
    { "lat": 33.8082, "lng": -84.1698 },
    { "lat": 33.8080, "lng": -84.1697 },
    { "lat": 33.8079, "lng": -84.1699 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "123 Main St, Stone Mountain, GA 30087",
    "coordinates": { "lat": 33.80805, "lng": -84.16985 },
    "areaSqFt": 5240,
    "areaAcres": 0.12,
    "source": "customer_polygon",
    "confidence": "customer_confirmed"
  }
}
```

`source` values: `customer_polygon` | `parcel_data` (future) | `cv_detected` (future).

## Frontend Component

`src/frontend/src/components/YardSizeMap.jsx` renders:

1. Address input (with Google Places autocomplete)
2. Satellite map centered on property (zoom ~19-20)
3. Polygon drawing tool (click to add vertices, double-click to close)
4. Live area readout in sq ft as user draws
5. "Confirm size" button → posts to backend

## Future Enhancements (Post-MVP)

- **Parcel data integration** (Regrid API, ~$99/mo) - pre-populate polygon from tax records
- **Auto-subtract house/driveway** using Google's building footprint data
- **Computer vision grass detection** - only if quote disputes become a real problem
- **Historical satellite imagery** - track lawn condition over time

## Testing Checklist

- [ ] Address autocomplete works for GA service areas
- [ ] Map loads at high zoom over the property
- [ ] User can draw a polygon with 3+ points
- [ ] Area updates in real-time while drawing
- [ ] Backend receives coordinates and returns sq ft
- [ ] Result stored on the Order/Property record
