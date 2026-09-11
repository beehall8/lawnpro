# Map measurement in booking

The address step offers “Help me measure my lawn” after the customer confirms a supported physical address. The map geocodes that address, displays satellite imagery at zoom 19, and lets customers tap corners and drag editable polygon points. The Geometry library calculates the drawn area. Confirming selects Small (up to 3,000), Medium (up to 6,000), Large (below 10,000), or XL (10,000 and above). Size cards remain available as a fallback. No AI detection or automatic property boundaries are claimed.

The old DrawingManager integration has been replaced by standard Map and Polygon events. The map does not require Places autocomplete: it uses the existing booking address and Geocoding instead.

## Activation

Enable Maps JavaScript API and Geocoding API in a billing-enabled Google Cloud project. Set VITE_GOOGLE_MAPS_API_KEY in the frontend build environment and redeploy. Restrict this browser key to the site hostname (and localhost for development), and to the required APIs. No private backend credential belongs in a VITE variable.

Missing credentials, ambiguous address matches, or loading failures leave size cards usable. Map-confirmed measurements stay in the page session and set the pricing tier; they are not persisted to orders. The existing estimate-size backend route is not called by this client flow. Outlines need customer review and may include incorrect or crossed areas; professional verification remains necessary.

## Verification

Frontend build and existing pricing tests pass. Live imagery, geocoding, drawing, and key restrictions must be checked with the configured account before launch. No Google credentials were added or provider charges incurred during implementation.
