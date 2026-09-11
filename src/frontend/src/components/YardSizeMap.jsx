import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * YardSizeMap
 * -----------
 * Address → satellite view → user draws polygon → area in sq ft.
 *
 * Requires Google Maps JS API loaded with libraries: places, drawing, geometry.
 * Set VITE_GOOGLE_MAPS_API_KEY in your .env file.
 *
 * Props:
 *   onSizeConfirmed({ address, coordinates, areaSqFt, areaAcres, polygon })
 */
export default function YardSizeMap({ onSizeConfirmed }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const drawingManager = useRef(null)
  const currentPolygon = useRef(null)
  const autocompleteRef = useRef(null)
  const addressInputRef = useRef(null)

  const [address, setAddress] = useState('')
  const [coordinates, setCoordinates] = useState(null)
  const [areaSqFt, setAreaSqFt] = useState(0)
  const [mapReady, setMapReady] = useState(false)

  // ---- Load Google Maps script once ----
  useEffect(() => {
    if (window.google?.maps) {
      setMapReady(true)
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('VITE_GOOGLE_MAPS_API_KEY is not set')
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,drawing,geometry`
    script.async = true
    script.defer = true
    script.onload = () => setMapReady(true)
    document.head.appendChild(script)
  }, [])

  // ---- Initialize map + autocomplete once ready ----
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstance.current) return

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 33.808, lng: -84.17 }, // Stone Mountain default
      zoom: 19,
      mapTypeId: 'satellite',
      tilt: 0,
      streetViewControl: false,
      fullscreenControl: false,
    })

    // Autocomplete on the address input
    if (addressInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        { types: ['address'], componentRestrictions: { country: 'us' } }
      )
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        if (!place.geometry) return
        const loc = place.geometry.location
        const coords = { lat: loc.lat(), lng: loc.lng() }
        setCoordinates(coords)
        setAddress(place.formatted_address || '')
        mapInstance.current.setCenter(coords)
        mapInstance.current.setZoom(20)
        clearPolygon()
      })
    }

    // Drawing manager for polygons
    drawingManager.current = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon'],
      },
      polygonOptions: {
        fillColor: '#4ade80',
        fillOpacity: 0.35,
        strokeColor: '#16a34a',
        strokeWeight: 2,
        editable: true,
        draggable: false,
      },
    })
    drawingManager.current.setMap(mapInstance.current)

    window.google.maps.event.addListener(
      drawingManager.current,
      'polygoncomplete',
      (polygon) => {
        clearPolygon()
        currentPolygon.current = polygon
        drawingManager.current.setDrawingMode(null)
        recalcArea()

        // Recalculate on edits
        const path = polygon.getPath()
        window.google.maps.event.addListener(path, 'set_at', recalcArea)
        window.google.maps.event.addListener(path, 'insert_at', recalcArea)
        window.google.maps.event.addListener(path, 'remove_at', recalcArea)
      }
    )
  }, [mapReady])

  const recalcArea = useCallback(() => {
    if (!currentPolygon.current || !window.google?.maps?.geometry) return
    const sqMeters = window.google.maps.geometry.spherical.computeArea(
      currentPolygon.current.getPath()
    )
    setAreaSqFt(Math.round(sqMeters * 10.7639))
  }, [])

  const clearPolygon = () => {
    if (currentPolygon.current) {
      currentPolygon.current.setMap(null)
      currentPolygon.current = null
      setAreaSqFt(0)
    }
  }

  const handleConfirm = () => {
    if (!currentPolygon.current || areaSqFt === 0) return
    const polygonCoords = currentPolygon.current
      .getPath()
      .getArray()
      .map((p) => ({ lat: p.lat(), lng: p.lng() }))

    onSizeConfirmed?.({
      address,
      coordinates,
      areaSqFt,
      areaAcres: +(areaSqFt / 43560).toFixed(3),
      polygon: polygonCoords,
    })
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">Property Address</label>
        <input
          ref={addressInputRef}
          type="text"
          placeholder="Start typing your address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div
        ref={mapRef}
        className="w-full rounded-md border"
        style={{ height: '480px' }}
      />

      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
        <div>
          <div className="text-sm text-gray-600">Yard Size</div>
          <div className="text-2xl font-bold text-green-700">
            {areaSqFt > 0
              ? `${areaSqFt.toLocaleString()} sq ft`
              : 'Draw a polygon around your yard'}
          </div>
          {areaSqFt > 0 && (
            <div className="text-xs text-gray-500">
              ≈ {(areaSqFt / 43560).toFixed(3)} acres
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearPolygon}
            disabled={areaSqFt === 0}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            onClick={handleConfirm}
            disabled={areaSqFt === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Confirm Size
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Tip: Click the polygon tool on top of the map, then click each corner of your yard.
        Double-click the last point to finish. Drag vertices to adjust.
      </p>
    </div>
  )
}
