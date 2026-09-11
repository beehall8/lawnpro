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
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
  useEffect(() => {
    if (!key || key.includes('...')) { setStatus('Map measurement is not available yet. Please choose a lawn-size card.'); return }
    let cancelled = false
    const listeners = []
    let failed = false
    const fail = message => {
      if (cancelled) return
      failed = true
      clearTimeout(timer)
      setReady(false)
      setStatus(message)
    }
    const previousAuthFailure = window.gm_authFailure
    const authFailure = () => fail('Google Maps could not authorize this website. Check the API key’s website restrictions, enabled APIs, and billing in Google Cloud.')
    window.gm_authFailure = authFailure
    let timer = setTimeout(() => { if (!cancelled) setStatus('The map is taking longer than expected. You can use the lawn-size cards instead.') }, 15000)
    loadMaps(key).then(async maps => {
      const [{ Map, Polygon }, { Geocoder }, { spherical }] = await Promise.all([
        maps.importLibrary('maps'), maps.importLibrary('geocoding'), maps.importLibrary('geometry')
      ])
      if (cancelled || failed) return
      setStatus('Locating your property…')
      const result = await new Geocoder().geocode({ address, componentRestrictions: { country: 'US', administrativeArea: 'GA' } })
      if (cancelled || failed) return
      const place = result.results[0]
      if (!place || place.partial_match || !['ROOFTOP', 'RANGE_INTERPOLATED'].includes(place.geometry.location_type)) throw new Error('We could not locate this exact street address. Check the address or use the size cards.')
      const map = new Map(host.current, { center: place.geometry.location, zoom: 19, mapTypeId: 'satellite', tilt: 0, streetViewControl: false, mapTypeControl: false, fullscreenControl: true })
      const shape = new Polygon({ map, paths: [], editable: true, fillColor: '#4ade80', fillOpacity: 0.35, strokeColor: '#16803d', strokeWeight: 2 })
      polygon.current = shape
      const update = () => {
        const points = shape.getPath()
        setPointCount(points.getLength())
        setArea(points.getLength() >= 3 ? Math.round(spherical.computeArea(points) * 10.7639104167) : 0)
        setConfirmed(false)
      }
      listeners.push(map.addListener('click', event => shape.getPath().push(event.latLng)))
      for (const event of ['set_at', 'insert_at', 'remove_at']) listeners.push(shape.getPath().addListener(event, update))
      clearTimeout(timer)
      setReady(true)
      setStatus('Check that the map shows your property. Click or tap each corner of the lawn in order; drag points to adjust. Exclude buildings and pavement. Use Clear to start again.')
    }).catch(error => {
      const code = error.code || error.status || ''
      if (code === 'REQUEST_DENIED') fail('Google denied the address lookup. Check that Geocoding API and billing are enabled and this website is allowed by the API key.')
      else if (code === 'ZERO_RESULTS') fail('Google could not find this address. Check the street address or use the size cards.')
      else fail(error.message || 'Map unavailable. Please use the size cards.')
    })
    return () => { if (window.gm_authFailure === authFailure) window.gm_authFailure = previousAuthFailure; cancelled = true; clearTimeout(timer); listeners.forEach(listener => listener.remove()); polygon.current?.setMap(null); polygon.current = null }
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
