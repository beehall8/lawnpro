# Lawn Pro on Hostinger

## Current release scope

The frontend can be published as a static prototype. Bookings and payments are
not connected to a working service. The backend uses in-memory data and needs
persistent storage and production authentication before serving real customers.

## GitHub deployment

On a Hostinger plan supporting Node.js web apps, import `beehall8/lawnpro`
and select the `main` branch. Configure the frontend as follows:

- Framework: Vite
- Root directory: `src/frontend`
- Node.js: 22
- Build command: `npm run build`
- Output directory: `dist`

The current frontend needs no API secrets to render. Never enter backend secrets
as Vite environment variables because they become public in the browser bundle.

## Static web hosting upload

Run `npm install` and `npm run build` inside `src/frontend`. Upload the contents
of `src/frontend/dist` to the selected website's document root, usually
`public_html`. Include the generated `.htaccess`, which sends direct visits to
React routes such as `/book` to `index.html` on Apache/LiteSpeed hosting.
Preserve or back up any existing website before replacing its files.

## Verify after publishing

Open `/`, `/book`, and `/vendor/dashboard`, and refresh each route. Confirm assets
load over HTTPS. The booking screens and vendor data are prototypes; publishing
these files does not activate order processing, payment collection, or accounts.

Hostinger documentation:
https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
