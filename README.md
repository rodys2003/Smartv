This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## SEO verification

The production canonical origin is `https://smartvpro.ordely.online` (defined in
`src/lib/seo.ts`). Public pages have individual titles, descriptions, canonical
URLs and social previews. The homepage publishes Organization, WebSite and
Service JSON-LD, with prices sourced from the existing catalog, not review stars.
The six services, compatibility and guide URLs are listed in `src/content/seo-pages.ts`.
Only the homepage and these published pages appear in `/sitemap.xml`.

Start `npm run dev`, then run in another terminal:

```bash
node --test --test-isolation=none scripts/check-seo.mjs
npx tsc --noEmit
npm run lint
npm run build
```

Set `SEO_TEST_URL` to test another **local** server. The SEO tests expect the production
canonical URLs even during local development. They inspect actual HTML, crawl
resources, catalog offers and private-page noindex metadata. `npm run lint` also
scans existing generated OpenNext output in this checkout and has baseline errors;
check changed source files separately to distinguish new issues.

### Crawl and media decisions

- `/admin` and `/dashboard` inherit `noindex, nofollow` from server layouts. They
  remain crawlable so crawlers can read noindex; this is not access control.
  Existing authentication and authorization are unchanged.
- Robots excludes `/api/` but explicitly allows `/api/media/`, which is the R2
  image fallback. Do not block this path without replacing all public image URLs.
- Public hero, gallery, installation and plan imagery uses checked-in WebP
  derivatives with responsive sizes. Originals are preserved; no R2 upload or
  change to Cloudflare image infrastructure is required.
- The public WhatsApp link appears only when `NEXT_PUBLIC_WHATSAPP_NUMBER` contains
  a valid-length number other than the existing placeholder. Reservation links
  remain available independently. This does not alter the ticket contact helper.

### Owner follow-up before production rollout

The supplied Google verification file is included at
`public/google93ae7228805f935a.html`, unchanged. After deployment, confirm it is
served at `https://smartvpro.ordely.online/google93ae7228805f935a.html`, then select
**Verify** in Search Console. Adding the file locally does not verify ownership.

1. Confirm business conditions for privacy, service terms, warranty and refunds.
   No policies, performance guarantees or response times have been invented.
2. Confirm customer permission and provenance for testimonials and photographs.
   The aggregate rating and unsupported volume/performance figures were removed;
   existing quotations are unchanged and not marked as independently verified.
3. Confirm the configured public contact number. Review the new Spanish content.
4. Deploy through the existing process only after authorization; then verify the
   URL-prefix property in [Search Console](https://search.google.com/search-console/)
   and submit `https://smartvpro.ordely.online/sitemap.xml`.
5. Validate markup with [Rich Results Test](https://search.google.com/test/rich-results)
   and measure mobile [PageSpeed Insights](https://pagespeed.web.dev/). Service
   JSON-LD does not guarantee a Google rich result or any search ranking.
6. Monitor real index coverage, queries and Core Web Vitals after rollout. No
   Search Console configuration, production deployment, analytics tracking,
   external account operations or live performance score is claimed here.

## Responsive account menu

On mobile and tablet layouts (below 1280 CSS pixels), the signed-in account menu
shows only the accessible sign-out button. Devices without hover retain this
compact menu even at wider landscape sizes. Desktop users retain the avatar,
name and administrator link; authentication and sign-out behavior are unchanged.

Run the isolated rendering checks without starting a server:

```bash
node --test --test-isolation=none scripts/check-user-menu.mjs
```

## Affiliate experience checks

The public program page uses the landing brand, responsive commission examples,
and visible existing payout conditions. The application name is a suggested
Google name, not a locked identity: clearing or editing it survives auth refreshes.

```bash
node --test --test-isolation=none scripts/check-affiliate-ux.mjs
npm run test:affiliates
```

The UX suite renders the actual application component with isolated auth/service
mocks. It covers clearing, replacement, account changes, labels, and submitted
profile values without creating real affiliate applications or financial records.

## Privacy information

`/privacidad` is a public information page linked from the shared footer and the
sitemap. The owner supplied `aethelsoft@gmail.com` as the privacy contact; the
mailto links only prepare an email and never submit a request automatically.

Encryption wording distinguishes HTTPS/TLS in transit from Supabase's documented
AES-256 storage encryption: https://supabase.com/security. It does not claim
end-to-end encryption, audited access policies, or absolute security. No encryption,
authorization, database or retention behavior was changed for this notice.

Before production publication, the owner should validate the legal responsible
party's full identity/contact details, retention periods, request-handling process,
and applicable privacy obligations. Only an email and business activity description
were supplied; no legal entity, registration number, address, response deadlines,
automatic erasure capability or compliance certification was invented.

The existing SEO suite checks the page, public contact, footer discovery, metadata,
sitemap membership and the scope of encryption wording.
