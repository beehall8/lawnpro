# Vendor approval setup

The application, admin review queue, approval controls, and approved-vendor sign-in are implemented. The existing FormSubmit email delivery remains active as a fallback until the API URL is configured.

## Routes

- Vendor application: `https://lawnproatl.com/vendors`
- Vendor sign-in: `https://lawnproatl.com/vendor/login`
- Vendor dashboard: `https://lawnproatl.com/vendor/dashboard`
- Private admin review: `https://lawnproatl.com/admin/vendors`

## Activate the database-backed queue

1. In Render, create a new Blueprint from `beehall8/lawnpro`.
2. Render reads `render.yaml` and creates the `lawnpro-api` service and PostgreSQL database.
3. After the first successful deployment, copy the public API URL.
4. In the Hostinger frontend deployment, add:

   ```env
   VITE_API_URL=https://YOUR-LAWNPRO-API.onrender.com
   ```

5. Redeploy the Hostinger frontend.
6. In Render, open the `lawnpro-api` environment variables and copy the generated `VENDOR_ADMIN_KEY`. This is the private passcode for `/admin/vendors`.

## Verify

1. Submit a new application at `/vendors`. Database-connected applications include password fields.
2. Open `/admin/vendors`, enter `VENDOR_ADMIN_KEY`, and confirm the application is Pending.
3. Approve it.
4. Sign in at `/vendor/login` with the applicant email and password.
5. Confirm rejected and pending applicants cannot enter `/vendor/dashboard`.

Applications submitted before the database connection was activated were delivered by email only and will not be backfilled automatically.
