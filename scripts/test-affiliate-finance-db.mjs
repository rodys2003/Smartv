import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

const modulePath = process.env.PGLITE_MODULE_PATH;
if (!modulePath) throw new Error('PGLITE_MODULE_PATH must point to an isolated @electric-sql/pglite installation.');
const { PGlite } = await import(pathToFileURL(modulePath).href);
const db = new PGlite();
const migration = readFileSync(new URL('../supabase/migrations/20261028133307_affiliate_finance.sql', import.meta.url), 'utf8');
const first = readFileSync(new URL('../supabase/migrations/20261027_affiliate_program.sql', import.meta.url), 'utf8');
const ids = {
  admin: '10000000-0000-0000-0000-000000000001',
  owner: '10000000-0000-0000-0000-000000000002',
  other: '10000000-0000-0000-0000-000000000003',
  buyer: '10000000-0000-0000-0000-000000000004',
};
const bootstrap = `
  CREATE ROLE anon; CREATE ROLE authenticated;
  CREATE SCHEMA auth;
  CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_app_meta_data jsonb DEFAULT '{}',raw_user_meta_data jsonb DEFAULT '{}');
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT jsonb_build_object('sub',auth.uid()) $$;
  GRANT USAGE ON SCHEMA auth,public TO anon,authenticated;
  GRANT EXECUTE ON FUNCTION auth.uid(),auth.jwt() TO anon,authenticated;
  CREATE TABLE public.tickets(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),ticket_number integer GENERATED ALWAYS AS IDENTITY,
    user_id uuid,service_name text,total_price numeric,status text DEFAULT 'waiting',notes text,updated_at timestamptz DEFAULT now());
  INSERT INTO auth.users(id,email,email_confirmed_at,raw_app_meta_data) VALUES
    ('${ids.admin}','admin@example.com',now(),'{"finance_admin":true}'),
    ('${ids.owner}','owner@example.com',now(),'{}'),
    ('${ids.other}','other@example.com',now(),'{}'),
    ('${ids.buyer}','buyer@example.com',now(),'{}');
`;
await db.exec(bootstrap);
console.info('DB bootstrap ready');
await db.exec(first);
console.info('Base affiliate schema ready');
await db.exec(migration);
console.info('Finance migration applied');
await db.exec(readFileSync(new URL('../supabase/tests/affiliate_finance.sql',import.meta.url),'utf8'));
await db.exec(`INSERT INTO public.affiliates(id,user_email,status,referral_code,binance_uid) VALUES
 ('${ids.owner}','owner@example.com','active','OWNER','12345'),
 ('${ids.other}','other@example.com','active','OTHER','67890')`);
const asUser = async (id, action) => {
  await db.exec(`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub','${id}',false)`);
  try { return await action(); } finally { await db.exec('RESET ROLE'); }
};
const rpc = async (fn, args = []) => (await db.query(`SELECT public.${fn}(${args.map((_,i)=>`$${i+1}`).join(',')}) AS result`,args)).rows[0].result;
const q = () => asUser(ids.owner,()=>rpc('affiliate_quote'));
const request = (quote, id=crypto.randomUUID()) => asUser(ids.owner,()=>rpc('affiliate_request_withdrawal',[quote,id]));
const admin = action => asUser(ids.admin,action);
const sale = async (price=20000, method='bre-b', code='OWNER', buyer=ids.buyer) => {
  const ticket=(await db.query("INSERT INTO tickets(user_id,service_name,total_price,notes) VALUES($1,'Plan',$2,$3) RETURNING id",[buyer,price,JSON.stringify({referral_code:code,payment_method:method})])).rows[0].id;
  await admin(()=>rpc('affiliate_set_ticket_payment',[ticket,true]));
  return ticket;
};
const age = async (ticket, days=7) => db.query("UPDATE affiliate_private.confirmed_payments SET paid_at=now()-($2 * interval '1 day') WHERE ticket_id=$1",[ticket,days]);
const transition = (payout, action, ref=null, reason=null) => admin(()=>rpc('affiliate_transition_payout',[payout.id,action,ref,reason]));
const ledgerHash = async () => JSON.stringify((await db.query('SELECT (SELECT jsonb_agg(c ORDER BY c.id) FROM affiliate_commissions c) AS c,(SELECT jsonb_agg(p ORDER BY p.id) FROM affiliate_payouts p) AS p,(SELECT jsonb_agg(a ORDER BY a.id) FROM affiliate_finance_audit a) AS a')).rows);

test('S5 RLS hides other accounts and denies direct financial writes / role spoofing', async () => {
  await asUser(ids.owner,async()=>{
    assert.equal((await db.query('SELECT count(*)::int AS n FROM affiliates')).rows[0].n,1);
    await assert.rejects(db.exec("UPDATE affiliates SET status='active'"), /permission denied/);
    await assert.rejects(db.exec("INSERT INTO affiliate_payouts(affiliate_id) VALUES(null)"), /permission denied/);
    await assert.rejects(rpc('affiliate_quote',[ids.other]), /otra cuenta/);
    await assert.rejects(rpc('affiliate_set_rate',[4000]), /administración/);
  });
  await db.query("UPDATE auth.users SET raw_user_meta_data='{"+'"finance_admin":true'+"}' WHERE id=$1",[ids.owner]);
  await asUser(ids.owner,()=>assert.rejects(rpc('affiliate_set_rate',[4000]), /administración/));
});

test('S2 unpaid service completion never creates withdrawable funds; no client financial override', async()=>{
  const ticket=(await db.query("INSERT INTO tickets(user_id,service_name,total_price,notes) VALUES($1,'Plan',17,$2) RETURNING id",[ids.buyer,JSON.stringify({referral_code:'OWNER',payment_method:'binance'})])).rows[0].id;
  await asUser(ids.buyer,()=>rpc('affiliate_capture_ticket',[ticket]));
  await admin(()=>rpc('affiliate_set_ticket_service',[ticket,'completed']));
  assert.equal((await q()).gross_usdt,0);
  await asUser(ids.other,()=>assert.rejects(rpc('affiliate_capture_ticket',[ticket]),/otro ticket/));
  const before=await ledgerHash();
  await assert.rejects(request({...await q(),gross_usdt:100,net_usdt:98}),/cotización cambió/);
  assert.equal(await ledgerHash(),before);
});

let copTicket;
test('S2/S4 exact seven-day payment boundary; missing rate excludes COP; fixed 30% basis', async()=>{
  copTicket=await sale();
  await age(copTicket,6.99999);
  assert.equal((await q()).gross_usdt,0);
  await age(copTicket,7.00001);
  assert.equal((await q()).gross_usdt,0);
  await admin(()=>rpc('affiliate_set_rate',[4000]));
  const quote=await q();
  assert.equal(quote.cop_amount,6000);
  assert.equal(quote.gross_usdt,1.5);
  assert.equal(quote.eligible,false);
  await assert.rejects(request(quote),/mínimo bruto 5/);
  const payment=(await db.query('SELECT paid_at FROM affiliate_private.confirmed_payments WHERE ticket_id=$1',[copTicket])).rows[0].paid_at;
  await admin(()=>rpc('affiliate_set_ticket_payment',[copTicket,true]));
  assert.equal((await db.query('SELECT paid_at FROM affiliate_private.confirmed_payments WHERE ticket_id=$1',[copTicket])).rows[0].paid_at.getTime(),payment.getTime());
});

let firstPayout;
test('S3/S4 stale rate/version rejects; request freezes values and reserves once',async()=>{
  const usdtTicket=await sale(20,'binance'); await age(usdtTicket,8);
  const stale=await q();
  await admin(()=>rpc('affiliate_set_rate',[4000]));
  await assert.rejects(request(stale),/cotización cambió/);
  const quote=await q();
  assert.equal(quote.gross_usdt,7.5); assert.equal(quote.fee_usdt,2); assert.equal(quote.net_usdt,5.5);
  const key=crypto.randomUUID();
  firstPayout=await request(quote,key);
  const repeat=await request(quote,key);
  assert.equal(repeat.id,firstPayout.id);
  assert.equal((await q()).gross_usdt,0);
  await assert.rejects(request(quote),/cotización cambió/);
  await admin(()=>rpc('affiliate_set_rate',[5000]));
  const saved=(await db.query('SELECT * FROM affiliate_payouts WHERE id=$1',[firstPayout.id])).rows[0];
  assert.equal(Number(saved.cop_to_usdt_rate),4000); assert.equal(Number(saved.net_amount_usdt),5.5);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM affiliate_payout_items WHERE payout_id=$1',[saved.id])).rows[0].n,2);
});

test('S3 completion validates admin, processing and reference; atomic ledger, idempotent completion',async()=>{
  await asUser(ids.owner,()=>assert.rejects(rpc('affiliate_transition_payout',[firstPayout.id,'processing']),/administración/));
  await assert.rejects(transition(firstPayout,'completed','TX-1'),/en proceso/);
  await transition(firstPayout,'processing'); await transition(firstPayout,'processing');
  await assert.rejects(transition(firstPayout,'completed',''),/referencia/);
  await transition(firstPayout,'completed','TX-1');
  const before=await ledgerHash(); await transition(firstPayout,'completed','TX-1'); assert.equal(await ledgerHash(),before);
  await assert.rejects(transition(firstPayout,'rejected',null,'mistake'),/cerrado/);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM affiliate_commissions WHERE payout_id=$1 AND status='paid'",[firstPayout.id])).rows[0].n,2);
  await assert.rejects(admin(()=>rpc('affiliate_set_ticket_payment',[copTicket,false])),/Concilia/);
  await assert.rejects(admin(()=>rpc('affiliate_set_ticket_service',[copTicket,'cancelled'])),/conciliación/);
});

test('S3 rejection requires reason, releases reservation, preserves snapshot and is idempotent',async()=>{
  const ticket=await sale(30,'binance'); await age(ticket,8);
  const payout=await request(await q());
  await assert.rejects(transition(payout,'rejected'),/motivo/);
  await transition(payout,'rejected',null,'Destino no confirmado; no se transfirió');
  await transition(payout,'rejected',null,'Destino no confirmado; no se transfirió');
  assert.equal((await q()).gross_usdt,9);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM affiliate_payout_items WHERE payout_id=$1',[payout.id])).rows[0].n,1);
  const next=await request(await q());
  assert.notEqual(next.id,payout.id);
  await transition(next,'processing');
  const before=await ledgerHash();
  await assert.rejects(transition(next,'completed','tx-1'),/unique/);
  assert.equal(await ledgerHash(),before);
  await transition(next,'completed','TX-2');
});

test('S5 partial write failure rolls back payout, reservation and audit',async()=>{
  const ticket=await sale(20,'binance'); await age(ticket,8); const quote=await q();
  await db.exec(`CREATE FUNCTION public.reject_test_item() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test rollback'; END $$;
    CREATE TRIGGER fail_item BEFORE INSERT ON affiliate_payout_items FOR EACH ROW EXECUTE FUNCTION reject_test_item()`);
  const before=await ledgerHash();
  await assert.rejects(request(quote),/test rollback/);
  assert.equal(await ledgerHash(),before);
  assert.equal((await q()).gross_usdt,6);
  await db.exec('DROP TRIGGER fail_item ON affiliate_payout_items; DROP FUNCTION reject_test_item()');
  await request(quote);
});

test('S2 inactive/self-owned/cancelled funds are never eligible; finite rate required',async()=>{
  await assert.rejects(sale(100,'binance','OWNER',ids.owner),/autorreferido/);
  assert.equal((await q()).gross_usdt,0);
  const ticket=await sale(20,'binance'); await age(ticket,8);
  await admin(()=>rpc('affiliate_admin_update',[ids.owner,'suspended']));
  assert.equal((await q()).eligible,false);
  await assert.rejects(request(await q()),/Saldo no disponible/);
  await admin(()=>rpc('affiliate_admin_update',[ids.owner,'active']));
  await admin(()=>rpc('affiliate_set_ticket_service',[ticket,'cancelled']));
  assert.equal((await q()).gross_usdt,0);
  for(const value of [0,-1,'NaN','Infinity']) await assert.rejects(admin(()=>rpc('affiliate_set_rate',[value])),/positiva/);
});

test('S2 exact minimum 5 USDT returns 3 net and large withdrawals always charge 2',async()=>{
  for(const [price,gross] of [[16.67,5],[10000,3000]]){
    const ticket=await sale(price,'binance'); await age(ticket,8);
    const quote=await q(); assert.equal(quote.gross_usdt,gross); assert.equal(quote.net_usdt,gross-2);
    const payout=await request(quote); assert.equal(payout.withdrawal_fee_usdt,2);
    await transition(payout,'processing'); await transition(payout,'completed',`size-${gross}`);
  }
});

test('S5 simultaneous quotes cannot consume the same commission twice',async()=>{
  const ticket=await sale(20,'binance'); await age(ticket,8); const quote=await q();
  // PGlite serializes a single connection; two independent requests still exercise stale snapshot admission.
  const results=await Promise.allSettled([request(quote),request(quote)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(results.filter(r=>r.status==='rejected').length,1);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM affiliate_commissions WHERE ticket_id=$1 AND payout_id IS NOT NULL',[ticket])).rows[0].n,1);
});
test('S2 legacy available rows remain non-withdrawable and retain history with a reconciliation flag without trusted payment', async()=>{
  const ticket=(await db.query("INSERT INTO tickets(user_id,service_name,total_price,notes) VALUES($1,'Legacy',100,'{}') RETURNING id",[ids.buyer])).rows[0].id;
  await db.query(`INSERT INTO affiliate_commissions(affiliate_id,referral_code,ticket_id,service_name,currency,
    gross_sale_price,net_sale_price,commission_amount,status,ticket_paid_at,available_at)
    VALUES($1,'OWNER',$2,'Legacy','USDT',100,100,30,'available',now()-interval '20 days',now()-interval '13 days')`,[ids.owner,ticket]);
  const rows=await asUser(ids.owner,()=>rpc('affiliate_get_commissions',[ids.owner]));
  const legacy=rows.find(row=>row.ticket_id===ticket);
  assert.equal(legacy.status,'available');
  assert.equal(legacy.requires_reconciliation,true);
  assert.ok(legacy.ticket_paid_at);
  assert.ok(legacy.available_at);
  await assert.rejects(admin(()=>rpc('affiliate_set_ticket_payment',[ticket,true])),/histórica/);
});

test('S5 historical duplicates fail the whole migration without deleting or changing old ledger', async()=>{
  const old=new PGlite();
  try {
    await old.exec(bootstrap); await old.exec(first);
    await old.query("INSERT INTO affiliates(id,user_email,status,referral_code) VALUES($1,'owner@example.com','active','OLD')",[ids.owner]);
    await old.query(`INSERT INTO affiliate_commissions(affiliate_id,referral_code,ticket_id,service_name,currency,
      gross_sale_price,net_sale_price,commission_amount) SELECT $1,'OLD',$2,'Historical','COP',20000,20000,6000 FROM generate_series(1,2)`,[ids.owner,crypto.randomUUID()]);
    await assert.rejects(old.exec(migration),/Historical duplicate/);
    await old.exec('ROLLBACK');
    assert.equal((await old.query('SELECT count(*)::int AS n FROM affiliate_commissions')).rows[0].n,2);
    assert.equal((await old.query("SELECT to_regclass('public.affiliate_finance_rate') AS name")).rows[0].name,null);
  } finally { await old.close(); }
});

test('S2 exactly seven days and native USDT remain eligible without a COP rate',async()=>{
  await db.exec('BEGIN');
  try {
    // Transaction time is fixed, so this is the exact boundary rather than a sleep-based approximation.
    const ticket=await sale(20,'binance'); await age(ticket,7);
    await db.exec('UPDATE affiliate_finance_rate SET cop_per_usdt=NULL');
    const quote=await q(); assert.equal(quote.gross_usdt,6); assert.equal(quote.eligible,true);
    assert.equal(quote.cop_per_usdt,null); assert.equal(quote.cop_amount,0);
  } finally { await db.exec('ROLLBACK'); }
});

test('S5 financial ticket deletion requires reconciliation instead of losing history',async()=>{
  await assert.rejects(db.query('DELETE FROM tickets WHERE id=$1',[copTicket]),/conciliación/);
});

test.after(() => db.close());
