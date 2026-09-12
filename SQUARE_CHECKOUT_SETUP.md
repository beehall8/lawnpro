# Square checkout setup

Lawn Pro charges a **25% booking deposit** at checkout. The Cloud Function recalculates the starting estimate on the server, charges the deposit through Square, and only then creates the `jobs` document in Firestore. The job includes the deposit and remaining balance.

## Before deployment

1. Keep the Square **Production Access Token** private. Do not place it in the frontend, a `.env` file committed to Git, or a chat message.
2. From an authenticated Firebase CLI or Firebase Cloud Shell in this project, set it as a Firebase secret:

   ```bash
   firebase functions:secrets:set SQUARE_ACCESS_TOKEN
   ```

3. Deploy the checkout function and the tighter Firestore rules:

   ```bash
   firebase deploy --only functions,firestore:rules
   ```

4. Deploy the frontend to Hostinger. The public Application ID and Location ID are already included as safe fallbacks; use the values in `.env.example` if Hostinger supports build-time variables.

## Test safely first

Use Square **Sandbox** credentials and change both public IDs plus the function URL to Square's sandbox endpoint before testing cards. Switch back to production IDs and `https://connect.squareup.com` only when ready for live payments.

## Operations

- Customer card data goes directly to Square's secure field; Lawn Pro never receives card numbers.
- A paid booking appears under Firestore `jobs` with `status: PENDING`.
- An approved vendor can accept it at `/vendor/dashboard`.
- The customer is charged only the deposit. The job’s `pricing.balanceCents` is the remaining amount due after service.
- When the assigned vendor uploads at least one finished-job photo and marks the job complete, Square emails the customer an invoice for `pricing.balanceCents` (the remaining 75%).
- Enable Firebase Storage before deploying, then include Storage rules in the deploy command:

  ```bash
  firebase deploy --only functions,firestore:rules,storage
  ```
