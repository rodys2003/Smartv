# Affiliate withdrawals: operator guide

Withdrawals now use database-validated quotes, a fixed 2 USDT fee and manual Binance transfers. The browser cannot choose the commission amount, exchange rate, owner or paid state. This change does not deploy a migration, confirm any real payment or send any funds.

## Before deployment

1. Back up the database and inspect its actual schema with separately authorized access. These changes were tested against an isolated PostgreSQL-compatible runtime, not the production database.
2. Reconcile historical duplicates, pending payouts and payment evidence. Do not delete ledger rows to make a migration succeed.
3. Apply `supabase/migrations/20261028133307_affiliate_finance.sql` through the project's approved deployment process. It expects the existing `tickets`, affiliate tables and `auth.users` schema. It runs transactionally; incompatible duplicate commissions/transfer references or non-finite ledger amounts abort it.
4. Provision an administrator through a trusted database/server operation, then verify access using a fresh authenticated session. Never put authorization in editable `user_metadata`.
5. Configure the COP per USDT rate in administration. No default market rate is assumed. Review the affiliate and admin quote screens before enabling real withdrawals.

Do not blindly replay older migrations: a historical nullable-code migration also clears pending referral codes. The new finance migration itself preserves historical rows.

## Administrator provisioning

`affiliate_private.is_admin()` checks the current `auth.uid()` against the server's `auth.users` row, requires a confirmed email and accepts `raw_app_meta_data.finance_admin = true`. It does not trust browser roles or `raw_user_meta_data`. The existing verified `developer01012003@gmail.com` account remains a compatibility administrator.

An authorized database operator can grant a known, verified user access with this parameterized pattern (replace the UUID deliberately; do not run on an unverified identity):

```sql
UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"finance_admin": true}'::jsonb
WHERE id = '<verified-admin-uuid>'::uuid
  AND email_confirmed_at IS NOT NULL;
```

Remove the trusted key to revoke added administrators. Database authorization checks the server row on every financial call, so it is not dependent on stale JWT metadata. The UI may require a refreshed session to show its navigation.

## Money rules

| Rule | Implementation |
|---|---|
| Commission | 30% of the recorded, administrator-confirmed ticket net price. Existing discounts and add-ons remain part of that recorded price. |
| Validation | Seven full days after the authoritative payment event; completing the service does not confirm payment or restart the clock. |
| Minimum | 5 USDT gross, giving 3 USDT net at the minimum. |
| Fee | Exactly 2 USDT for every accepted withdrawal, regardless of amount. |
| Conversion | Sum original COP commissions, divide by the current manual COP-per-USDT rate, add native USDT commissions, then round the aggregate to two decimals. |
| No rate | COP is excluded from the quote, never converted at 1:1 or an invented fallback. Mature native USDT may still be quoted independently; the UI explains the exclusion. |
| Reservation | The request freezes commission IDs, original currency amounts, rate/version, Binance UID, gross, fee and net in one transaction. |
| Stale quote | Any change to included commissions, destination, amounts or rate version requires a new confirmation. |
| Paid history | Rate/destination changes never recalculate old withdrawals. Original COP ledger amounts remain unchanged. |

The quote includes all currently eligible commissions; partial custom-amount withdrawals are not implemented. `commission_ids` and `affiliate_payout_items` preserve historical membership even after a rejected request releases its current reservation.

## Daily operation

1. Confirm the client's actual payment in the ticket controls. The database locks the ticket and captures/reconciles its commission from persisted referral metadata, even if the original client-side estimated capture failed. It ignores client RPC monetary overrides. Invalid/inactive/self-owned referrals require correction before the sale can be confirmed; ordinary non-referral tickets still work.
2. After seven days, the active affiliate reviews the exact quote and submits a withdrawal with a stable request UUID. Repeating the same request returns the same payout; funds cannot enter a second payout.
3. Review the request and mark it **Processing** before leaving the application to make the manual Binance transfer.
4. Transfer only the frozen net amount to the frozen destination. Record its unique Binance reference and mark it **Completed**. Both the payout and its commissions change atomically.
5. To reject an unpaid request, give a reason and positively establish that no transfer occurred. The reservation is released; its snapshot and audit remain.

**Uncertain transfer outcome:** leave the request in Processing, reconcile with Binance and do not resend. The application has no automatic transfer or retry operation. A duplicate transfer reference is rejected case-insensitively. Completed requests cannot be rejected or reopened through these RPCs.

## Historical reconciliation

Older clients could mark commissions available before a trustworthy payment event and created payout associations without immutable snapshots. The migration cannot infer which historical rows represent genuine money.

- Original statuses, timestamps and amounts are preserved. The read API adds `requires_reconciliation` to legacy validating/available commissions lacking a trusted payment log; these rows are excluded from all withdrawal quotes.
- The operator must verify the actual original customer payment, affiliate identity, price/discount basis, cancellation/refund status and any existing payout using external evidence. A new payment confirmation is **not** a substitute for historical evidence and is refused for legacy validating/available rows. Never reset their seven-day clock silently.
- After explicit authorization and verified evidence, a database operator may reconcile the private `affiliate_private.confirmed_payments` record with the **actual original payment timestamp and actor**, preserving the original ledger. This deliberately has no bulk, browser-accessible “release now” endpoint.
- Legacy pending/processing payouts without commission snapshots cannot be transitioned by the new application; reconcile membership, balances and Binance outcome first. Never fabricate a reference or overwrite a completed history to unlock a payout.
- Historical completed payouts stay visible. Duplicated ticket commissions or transfer references block migration and require a documented operator decision.

Production historical reconciliation and schema verification remain deployment prerequisites, not work claimed completed by this local implementation.

## Security and failure behavior

Every old policy on affiliate financial tables is replaced; owners can read only their own account, commissions, payout and item rows. Audit is administrator-only. Direct authenticated/anonymous ledger writes are revoked. Registration derives user ID/email from the authenticated server identity; profile updates cannot self-activate or change a commission rate. Public referral lookup returns only active referral identity, not email, phone or payout details.

Security-definer RPCs have an empty `search_path`, explicit actor checks and an execute allowlist. Private helpers are not callable by clients. Monetary operations use one transaction-scoped advisory lock plus unique ticket/request/reference indexes. This global lock favors correctness for the low-volume manual workflow; revisit throughput only with real contention measurements. Ticket guards prevent older clients from mutating a paid/reserved financial record outside reconciliation.

If the migration or an RPC is unavailable, the browser surfaces the error; it never falls back to direct monetary writes. Payment reversal/cancellation with a reserved/paid payout is refused until manual reconciliation. Errors after inserting a payout roll back its reservation, items and audit together.

## Local verification

The disposable runtime lives outside the repository and is not a production dependency:

```sh
node --test --test-isolation=none scripts/test-affiliate-finance.mjs
PGLITE_MODULE_PATH=/tmp/smarttv-finance-test-runtime/node_modules/@electric-sql/pglite/dist/index.js \
  node --test --test-isolation=none scripts/test-affiliate-finance-db.mjs
npx tsc --noEmit
```

The database harness executes `supabase/tests/affiliate_finance.sql` and tests RLS, permissions, maturity, conversion, stale quotes, snapshots, minimum/fee, idempotent transitions, duplicate references, rollback and legacy preservation. PGlite serializes one connection: the double-request test proves duplicate-admission rejection but is **not** proof of independent PostgreSQL session contention. Run a two-session PostgreSQL smoke test and approved Supabase security advisors before production rollout.

## Rollback boundary

Keep finance operations unavailable if schema and application versions diverge. Restore application/schema together through the approved rollback process; do not restore permissive policies, delete payout history or re-enable old client-side ledger writes. Any real transfer already made remains an external fact to reconcile, not something a code rollback can undo.

## References

- [Supabase database functions and execution privileges](https://supabase.com/docs/guides/database/functions)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL explicit/advisory locking](https://www.postgresql.org/docs/current/explicit-locking.html)
