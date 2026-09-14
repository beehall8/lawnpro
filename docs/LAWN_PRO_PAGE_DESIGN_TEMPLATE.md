# Lawn Pro Website Design System and Page Template

Use this document as the source of truth when creating or editing pages for **Lawn Pro ATL**. New pages must look like they belong to the existing production site at `lawnproatl.com`.

## 1. Technology and file conventions

- Frontend: React 18 with Vite.
- Routing: `react-router-dom`.
- Styling: Tailwind CSS plus small page-specific CSS files.
- Icons: `lucide-react`.
- Body font: Inter with system fallbacks.
- Do not add a second CSS framework or component library.
- Shared global styles live in `src/frontend/src/index.css`.
- Tailwind tokens live in `src/frontend/tailwind.config.js`.
- Page-specific CSS should be imported directly by its page component.
- Pages belong in `src/frontend/src/pages/`.
- Shared components belong in `src/frontend/src/components/`.
- Add public routes in `src/frontend/src/App.jsx`.
- Protected vendor pages must remain inside `<ProtectedVendorRoute />`.

## 2. Brand personality

Lawn Pro should feel:

- Friendly, dependable, local, clean, natural, and professional.
- Bright and spacious rather than dark or overly corporate.
- Easy for homeowners and lawn-care vendors to understand on mobile.
- Premium enough to establish trust without feeling expensive or exclusive.

Use short headings, plain language, clear next actions, and reassuring status messages.

## 3. Color system

These are the canonical Tailwind tokens:

```js
colors: {
  lawn: {
    50:  '#f2fcf5',
    100: '#e1f8e8',
    200: '#c7f0d3',
    300: '#a0e5b5',
    400: '#6ed18e',
    500: '#3fb86c',
    600: '#2c9a55',
    700: '#257d45',
    800: '#206439',
    900: '#1b5230',
  },
  earth: {
    50:  '#faf8f5',
    100: '#f5f0e8',
    200: '#ebe2d3',
    300: '#ddcdb5',
    400: '#cbb38d',
    500: '#b59567',
    600: '#9f7d4f',
    700: '#846540',
    800: '#6b5236',
    900: '#58432e',
  }
}
```

Supporting neutral colors should use Tailwind's `gray` palette.

Usage:

- Main brand/action: `lawn-600`.
- Hover action: `lawn-700`.
- Dark brand text: `lawn-800` or `lawn-900`.
- Soft branded surface: `lawn-50`.
- Soft branded border: `lawn-100` or `lawn-200`.
- Secondary warm action: `earth-600`, hover `earth-700`.
- Page background: `gray-50`, white, or `lawn-50`.
- Main text: `gray-900`.
- Supporting text: `gray-600`.
- Error: red-50 background, red-200 border, red-800 text.
- Warning/pending: amber-50 background, amber-200 border, amber-800/900 text.
- Success/approved: lawn-50/100 background, lawn-700/800 text.

Do not introduce unrelated blue, purple, neon, or black-heavy themes. Blue may be used sparingly for financial metrics.

## 4. Typography

Global body:

```css
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
```

Application pages:

- Main page title: `text-3xl font-bold text-gray-900`.
- Section title: `text-xl font-bold text-gray-900`.
- Card title: `text-lg font-semibold` or `text-xl font-bold`.
- Eyebrow: `text-sm font-bold uppercase tracking-wider text-lawn-700`.
- Body: `text-gray-600`, normally 16px.
- Helper text: `text-sm text-gray-500` or `text-sm text-gray-600`.
- Labels: `text-sm font-semibold text-gray-700`.

Marketing hero only:

```css
font-family: Georgia, 'Times New Roman', serif;
font-size: clamp(44px, 5.3vw, 78px);
line-height: 1.08;
font-weight: 700;
letter-spacing: -2px;
color: #272e20;
```

Do not use the serif hero font for dashboards, forms, admin pages, or card headings.

## 5. Spacing, shape, and depth

- Main content width: `max-w-7xl`; narrow form/detail pages: `max-w-2xl`, `max-w-3xl`, or `max-w-4xl`.
- Main page padding: `px-4 py-8` or `px-4 py-10`.
- Desktop horizontal padding may use `sm:px-6 lg:px-8`.
- Standard card padding: 24px (`p-6`).
- Major section gap: 28–32px (`mt-7`, `mt-8`).
- Content gap: 12–20px.
- Standard radius: `rounded-lg` for controls and `rounded-xl` for cards.
- Feature/admin panels can use `rounded-2xl` or `rounded-3xl`.
- Borders: subtle `border border-gray-100` or `border-gray-200`.
- Shadows: restrained `shadow-md`; hover cards may use `hover:shadow-lg`.
- Avoid glassmorphism, strong gradients, heavy drop shadows, and excessive animation.

## 6. Canonical shared components

The global CSS must retain these classes:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.btn-primary {
  @apply bg-lawn-600 hover:bg-lawn-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200;
}

.btn-secondary {
  @apply bg-earth-600 hover:bg-earth-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200;
}

.card {
  @apply bg-white rounded-xl shadow-md p-6 border border-gray-100;
}

.service-card {
  @apply card cursor-pointer hover:shadow-lg transition-shadow duration-200;
}

.service-card.selected {
  @apply border-2 border-lawn-500 bg-lawn-50;
}
```

### Primary button

```jsx
<button
  type="button"
  className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
>
  Continue
</button>
```

### Secondary/outline button

```jsx
<button
  type="button"
  className="rounded-lg border border-lawn-600 bg-white px-5 py-3 font-semibold text-lawn-700 transition hover:bg-lawn-50"
>
  Back
</button>
```

### Standard card

```jsx
<section className="card">
  <h2 className="text-xl font-bold text-gray-900">Section title</h2>
  <p className="mt-2 text-gray-600">Short supporting description.</p>
</section>
```

### Form field

```jsx
<label className="block text-sm font-semibold text-gray-700">
  Field name
  <input
    type="text"
    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100"
  />
</label>
```

### Error message

```jsx
<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
  We could not complete that request. Please try again.
</div>
```

### Pending status badge

```jsx
<span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
  PENDING
</span>
```

### Success status badge

```jsx
<span className="rounded-full border border-lawn-200 bg-lawn-50 px-3 py-1 text-xs font-bold text-lawn-800">
  APPROVED
</span>
```

### Empty state

```jsx
<section className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
  <h2 className="mt-4 text-xl font-bold text-gray-800">Nothing here yet</h2>
  <p className="mt-2 text-gray-600">New items will appear here automatically.</p>
</section>
```

## 7. Header patterns

### Public/brand header

- White or transparent background.
- Lawn Pro wordmark on the left.
- One clear primary action on the right.
- Use the `Leaf` or `Sprout` Lucide icon.
- Keep the mobile version compact.

### Dashboard header

```jsx
<header className="border-b border-gray-200 bg-white">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-lawn-700">
      <Sprout /> Lawn Pro
    </Link>
    <div className="flex items-center gap-3">
      {/* Contextual navigation and account action */}
    </div>
  </div>
</header>
```

Vendor dashboards may use `bg-lawn-700 text-white` for stronger role distinction. Admin pages should normally use a white header.

## 8. Standard application-page layout

Use this exact structure as the starting point for new account, vendor, customer, or admin pages:

```jsx
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Sprout } from 'lucide-react'

function NewLawnProPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-lawn-700">
            <Sprout aria-hidden="true" />
            Lawn Pro
          </Link>
          <Link to="/book" className="btn-primary py-2">
            Book service
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-wider text-lawn-700">
            Page category
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Clear page title
          </h1>
          <p className="mt-3 text-lg leading-8 text-gray-600">
            One short sentence explaining the page and its primary benefit.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(item => (
            <article key={item} className="card transition-shadow hover:shadow-lg">
              <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-lawn-50 text-lawn-700">
                <Leaf aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-gray-900">Card title</h2>
              <p className="mt-2 leading-7 text-gray-600">Helpful card description.</p>
              <button type="button" className="mt-5 inline-flex items-center gap-2 font-semibold text-lawn-700 hover:text-lawn-800">
                Learn more <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </section>

        <section className="card mt-8">
          <h2 className="text-xl font-bold">Form or primary content</h2>
          <p className="mt-2 text-gray-600">Keep forms short and explain why information is needed.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-gray-700">
              First field
              <input className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Second field
              <input className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-normal focus:border-lawn-600 focus:outline-none focus:ring-2 focus:ring-lawn-100" />
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary">Save and continue</button>
            <button className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default NewLawnProPage
```

## 9. Responsive rules

Canonical breakpoints used by the site:

- Mobile: up to 700px.
- Small mobile refinement: up to 400px or 360px.
- Tablet/small desktop: up to 900px or 1150px.
- Large desktop: 1600px and above.

Requirements:

- Start with one-column mobile content.
- Switch card grids to two columns at `md`, three only when content fits.
- Buttons should become full width on small screens when they are the primary action.
- Never require horizontal page scrolling.
- Use `overflow-x-auto` for status-filter rows.
- Maintain at least 16px page-edge spacing on mobile.
- Sticky sidebars must become normal-flow blocks below 1150px.
- Keep tap targets at least about 44px high.
- Long IDs, addresses, and email addresses must wrap with `break-all` or `overflow-wrap:anywhere`.

## 10. Accessibility requirements

- Every input has a visible `label`.
- Add `aria-hidden="true"` to decorative icons.
- Use `role="alert"` for errors and `role="status"` for progress/success updates.
- Use real buttons for actions and links only for navigation.
- Disabled buttons must use both the `disabled` attribute and a visible disabled style.
- Keyboard focus must remain visible:

```css
button:focus-visible,
a:focus-visible {
  outline: 3px solid #75a854;
  outline-offset: 3px;
}
```

- Do not communicate status using color alone; always include text.
- Images need meaningful alt text unless decorative.
- Preserve readable contrast, particularly on `lawn-600` and `lawn-700` surfaces.

## 11. Interaction and content rules

- Show a loading spinner and verb-based label for async actions: “Saving…”, “Processing payment…”, or “Uploading photos…”.
- Prevent duplicate submission while an action is processing.
- Put validation messages next to the relevant section.
- On success, give a confirmation number and explain the next step.
- Use sentence case for buttons and headings.
- Prefer direct labels: “Accept job”, “Complete job”, “Mark vendor paid”.
- Do not use placeholder sample records in production pages.
- Do not expose customer contact details until a vendor has accepted the job.
- Never put secret API keys or access tokens in frontend code.
- Square card details must remain inside Square's secure payment field.
- Authentication and data access must continue to use Firebase.

## 12. Existing canonical routes

- Homepage: `/`
- Customer booking: `/book`
- Booking confirmation: `/booking-confirmation/:jobId`
- Vendor application: `/vendors`
- Vendor login: `/vendor/login`
- Vendor dashboard: `/vendor/dashboard`
- Vendor job completion: `/vendor/complete/:jobId`
- Admin vendor approvals: `/admin/vendors`
- Admin jobs and payouts: `/admin/jobs`

Do not create competing routes for the same purpose.

## 13. Instructions for another AI model

Copy the following prompt before asking another model to create a Lawn Pro page:

> You are editing the existing Lawn Pro React/Vite frontend. Read `docs/LAWN_PRO_PAGE_DESIGN_TEMPLATE.md`, `src/frontend/src/index.css`, and `src/frontend/tailwind.config.js` before making changes. Match the existing Lawn Pro design exactly. Use React, Tailwind CSS, lucide-react icons, the existing `.card`, `.btn-primary`, and `.btn-secondary` classes, and the canonical lawn/earth color tokens. Keep the page responsive, accessible, and consistent with existing routes. Do not introduce a new UI framework, substitute colors, expose secrets, add fake production data, or duplicate authentication/payment infrastructure. Reuse existing Firebase and Square modules. Run the frontend production build and existing tests before delivering the change. Clearly list all files changed and any deployment or rules updates required.

## 14. Final model checklist

Before accepting a new page, confirm:

- It uses the exact Lawn Pro color tokens.
- It uses Inter; Georgia is reserved for the marketing hero.
- It reuses global button and card styles.
- It works at 360px, 700px, tablet, and desktop widths.
- Loading, empty, error, and success states exist where needed.
- All controls are keyboard-accessible and labeled.
- It uses Lucide icons rather than mismatched icon packs.
- It uses an existing route or adds one deliberately to `App.jsx`.
- Firebase/Square secrets are never included in the browser.
- The production build passes.
- Any required Firestore, Storage, or Function deployment is documented.
