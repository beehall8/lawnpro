import { useEffect, useRef, useState } from 'react'

let mapsPromise
function loadMaps(key) {
  if (window.google?.maps?.geometry) return Promise.resolve(window.google.maps)
  if (!mapsPromise) mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const callback = '__lawnProMapsReady'
    window[callback] = () => { delete window[callback]; resolve(window.google.maps) }
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=geometry&callback=${callback}&loading=async`
    script.async = true
    script.onerror = () => { script.remove(); delete window[callback]; mapsPromise = null; reject(new Error('Map could not load. Please use the size cards.')) }
    document.head.appendChild(script)
  })
  return mapsPromise
}

export default function YardSizeMap({ address, onSizeConfirmed }) {
  const host = useRef(null)
  const polygon = useRef(null)
  const [status, setStatus] = useState('Loading satellite map…')
  const [area, setArea] = useState(0)
  const [pointCount, setPointCount] = useState(0)
  const [ready, setReady] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  useEffect(() => {
    if (!key || key.includes('...')) { setStatus('Map measurement is not available yet. Please choose a lawn-size card.'); return }
    let cancelled = false
    const listeners = []
    let timer = setTimeout(() => { if (!cancelled) setStatus('The map is taking longer than expected. You can use the lawn-size cards instead.') }, 15000)
    loadMaps(key).then(async maps => {
      const result = await new maps.Geocoder().geocode({ address, componentRestrictions: { country: 'US', administrativeArea: 'GA' } })
      if (cancelled) return
      const place = result.results[0]
      if (!place || place.partial_match || !['ROOFTOP', 'RANGE_INTERPOLATED'].includes(place.geometry.location_type)) throw new Error('We could not locate this exact street address. Check the address or use the size cards.')
      const map = new maps.Map(host.current, { center: place.geometry.location, zoom: 19, mapTypeId: 'satellite', tilt: 0, streetViewControl: false, mapTypeControl: false, fullscreenControl: true })
      const shape = new maps.Polygon({ map, paths: [], editable: true, fillColor: '#4ade80', fillOpacity: 0.35, strokeColor: '#16803d', strokeWeight: 2 })
      polygon.current = shape
      const update = () => {
        const points = shape.getPath()
        setPointCount(points.getLength())
        setArea(points.getLength() >= 3 ? Math.round(maps.geometry.spherical.computeArea(points) * 10.7639104167) : 0)
        setConfirmed(false)
      }
      listeners.push(map.addListener('click', event => shape.getPath().push(event.latLng)))
      for (const event of ['set_at', 'insert_at', 'remove_at']) listeners.push(shape.getPath().addListener(event, update))
      clearTimeout(timer)
      setReady(true)
      setStatus('Check that the map shows your property. Click or tap each corner of the lawn in order; drag points to adjust. Exclude buildings and pavement. Use Clear to start again.')
    }).catch(error => { if (!cancelled) setStatus(error.message || 'Map unavailable. Please use the size cards.') })
    return () => { cancelled = true; clearTimeout(timer); listeners.forEach(listener => listener.remove()); polygon.current?.setMap(null); polygon.current = null }
  }, [address, key])
  return <section className="yard-map-panel" aria-label="Measure your lawn on a map">
    <p role="status">{status}</p>
    {key && !key.includes('...') && <div ref={host} className="yard-map-canvas" />}
    {ready && <>
      <p><strong>{area.toLocaleString()} sq ft</strong> · Customer-drawn estimate</p>
      <div className="yard-map-actions">
        <button type="button" onClick={() => polygon.current?.getPath().pop()} disabled={!pointCount}>Undo point</button>
        <button type="button" onClick={() => polygon.current?.getPath().clear()}>Clear</button>
        <button type="button" disabled={area <= 0 || area > 1000000} onClick={() => { onSizeConfirmed({ address, areaSqFt: area }); setConfirmed(true) }}>Use this lawn size</button>
      </div>
      {confirmed && <p role="status">Size selected. The matching lawn-size card is selected below.</p>}
      <p className="text-sm">Draw a single outline without crossing lines. This measures your outline, not a surveyed boundary. Confirm the selected size card before continuing.</p>
    </>}
  </section>
}
