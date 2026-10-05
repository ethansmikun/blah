# Swerve City storefront

Next.js 16 ecommerce storefront for Swerve City. Orders use the existing manual Apple Cash or Zelle flow. An order request is emailed to the brand; this app never processes card payments, confirms payment, or reserves inventory.

## Local development

Use Node 24 and pnpm (the exact package manager is declared in `package.json`).

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm test
pnpm build
```

Copy `.env.example` to `.env.local` for a real local order-email test. Do not commit `.env.local`.

## Vercel relaunch

1. Put this folder in a Git repository and push it to the branch you want to deploy.
2. In Vercel, import that repository. The framework preset should be **Next.js**. Leave the root directory as `.` and use the detected build command (`pnpm build`).
3. In **Settings → Environment Variables**, add these values for Preview and Production:
   - `RESEND_API_KEY`: server-only Resend API key.
   - `RESEND_EMAIL_DOMAIN`: verified sending domain only, for example `example.com`; do not enter an email address.
   - `ORDER_NOTIFICATION_EMAIL`: optional destination for order alerts. It defaults to `Swervecitybrandd@gmail.com` if omitted.
4. Create a preview deployment. Confirm the homepage, menu, product dialog, cart, and one order request using a real verified Resend sender. Check the recipient inbox and verify that the returned order number and amount match.
5. Confirm that the Vercel function logs contain no errors and promote the preview to Production.

Vercel detects the included `pnpm-lock.yaml` and the `packageManager` field. This project has no client-exposed environment variables; do not add the `NEXT_PUBLIC_` prefix to the Resend key.

## Rollback

Keep the prior production deployment intact while you validate the preview. If the relaunch has a problem, open the previous known-good deployment in Vercel and use **Promote to Production**. That changes traffic immediately without deleting the new deployment. Then inspect the failed deployment logs before retrying.
