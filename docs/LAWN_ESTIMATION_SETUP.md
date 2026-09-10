# Lawn measurement rollout

## Current implementation

The booking flow now uses customer-selected Small, Medium, Large and XL tiers instead of AI or numeric measurement entry. The tiers show the approved mowing time and price ranges. Mowing estimates, frequency discounts, and the existing platform fee apply to both ends of the range; XL remains open-ended. Other services retain their prices. The hero is unchanged.

The address step checks required fields, Georgia, the eight launch ZIP codes and common PO Box formats. This is input validation and customer confirmation, not geocoding. Changing an address clears its confirmation and size selection. Booking selections remain in page memory; persistent booking submission and checkout are unfinished.

The backend no longer generates random lawn measurements. POST /api/v1/properties/estimate and property creation with requestEstimate return HTTP 503 with ESTIMATION_UNAVAILABLE. Manual API measurements remain explicitly customer-provided and unverified. No paid provider is connected.

## Future AI work (deferred)

The provider evaluation and activation notes below are optional future work. The current release uses size tiers and does not require an imagery account.

## Provider evaluation — no purchase or outreach performed

Nearmap is a candidate, not a configured provider. Ask for written confirmation of:

- Lawn Grass AI data and parcel coverage for all eight ZIP codes, including imagery capture dates.
- Whether parcel-clipped lawn geometry and area are available through the licensed API; treatment of tree-covered lawns and missing detections.
- Rights to display imagery, outlines and derived measurements to homeowners and vendors, and permitted retention/caching.
- Minimum subscription, per-property/request charges, quotas, trial access and commercial customer-facing use.

References:
- https://help.nearmap.com/kb/articles/795-ai-pack-surfaces
- https://developer.nearmap.com/docs/parcel-mode-user-guide
- https://cloud.google.com/maps-platform/terms

Do not assume Google Maps display access permits extracting lawn polygons or training AI from its imagery. The old README's accuracy and monthly cost figures are unvalidated planning assumptions.

## Activation work after provider selection

1. Confirm coverage and obtain a suitably licensed trial/account. Store credentials only in backend hosting secrets, never VITE variables or source control.
2. Deploy the backend with restricted CORS, abuse protection and request limits before exposing paid inference. Connect the frontend using its API base URL. Keep secrets out of the static Hostinger build.
3. Implement the actual provider adapter using the purchased API contract. Resolve and confirm the physical property and boundary before measuring. Do not count neighboring lawns or use entire lot area as lawn area.
4. Return provider attribution, capture date, parcel identity, lawn geometry, area units and review status. Convert measured geometry using an appropriate geospatial area calculation. Missing imagery, tree cover and uncertain boundaries must lead to manual review, not invented values or confidence scores.
5. Connect the UI to this endpoint with loading, timeout and retry states; cancel/discard responses after address edits. Display the property and lawn outline for confirmation and retain the original measurement separately from customer corrections.
6. Add persistent measurement storage and vendor verification. Establish a lawn-size pricing policy separately; current fixed service prices do not change automatically.
7. Evaluate against independently measured properties across the launch area. Document errors and coverage failures before advertising accuracy or enabling automatic quotes.

## Local verification

Run `node --test tests/*.test.mjs` from the repository root after installing backend dependencies. Build with `npm run build` in src/frontend. The frontend can preview without a backend or provider account. No simulated measurements are presented to customers.
