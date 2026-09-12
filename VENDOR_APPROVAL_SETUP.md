# Firebase vendor approval setup

The vendor application queue uses Firebase Authentication and Cloud Firestore in project `lawnproatl-85df0`. Render and PostgreSQL are not required for this workflow.

## Live routes

- Application: `https://lawnproatl.com/vendors`
- Vendor sign-in: `https://lawnproatl.com/vendor/login`
- Approved vendor dashboard: `https://lawnproatl.com/vendor/dashboard`
- Admin review queue: `https://lawnproatl.com/admin/vendors`

## Firebase configuration

- Firestore database: `(default)`, Standard edition, `nam5`
- Authentication provider: Email/Password
- Admin email: `cliquebots@gmail.com`
- Security rules: `firestore.rules`
- Firebase project mapping: `.firebaserc`

The registered web app configuration is included in the frontend so the existing GitHub deployment works without a new Hostinger environment-variable step. Optional `VITE_FIREBASE_*` variables can override it later. These are public browser configuration values, not Firebase Admin SDK credentials.

Deploy rule changes from the repository root with:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project lawnproatl-85df0
```

## First admin sign-in

1. Open `/admin/vendors`.
2. Choose **First time? Create the admin account**.
3. Use `cliquebots@gmail.com` and a unique password.
4. Open the Firebase verification email and verify the address.
5. Return to `/admin/vendors`, sign in, and review applications.

The Firestore rules authorize the project's exact Firebase admin user ID for admin reads and status updates.

## Verify the workflow

1. Submit a new application at `/vendors` and create a vendor password.
2. Confirm it appears as **Pending** at `/admin/vendors`.
3. Confirm the vendor cannot access `/vendor/dashboard` while pending.
4. Approve the application in the admin queue.
5. Sign in at `/vendor/login` with the applicant email and password.
6. Confirm the approved vendor reaches the dashboard.

## Verify the job flow

1. Submit a customer service request at `/book`.
2. Confirm a new `PENDING` document appears in the Firestore `jobs` collection.
3. Sign in as an approved vendor and confirm the request appears under **Available jobs**.
4. Select **Accept job**.
5. Confirm it disappears from the available queue and appears under **My jobs** for that vendor.

Job acceptance uses a Firestore transaction, so only one vendor can claim each pending job. Approved vendors can read pending jobs and their own accepted jobs; customer contact details appear in the interface only after acceptance.

Applications submitted before Firestore was connected were delivered by email only and are not backfilled automatically.
