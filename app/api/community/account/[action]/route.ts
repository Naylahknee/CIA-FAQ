import { env } from 'cloudflare:workers';
import { randomBytes } from 'node:crypto';
import { accountRow, checkFactor, sendAccountEmail, type SecurityRow } from '../../../../account-security';
import { clearSession, emailVerificationConfigured, getCommunityUser, noStoreJson, normalizeEmail, takeAuthAttempt, validSameOrigin } from '../../../../community-auth';
import { hashPassword, passwordError, verifyPassword } from '../../../../password-security';
import { base32, digest, matchingStep, seal, unseal } from '../../../../security-crypto';
import { completeNeonPasswordReset, completeNeonVerification, getNeonAuthDb, mirrorCommunityUser, neonAuthConfigured, neonSecurityRowByEmail, neonTokenUser, neonUserById } from '../../../../neon-auth';
import { ensureD1AuthSchema } from '../../../../community-auth-schema';
const fail = (error:string,status=400) => noStoreJson({error},{status});
export async function POST(request:Request, context:{params:Promise<{action:string}>}) {
 try {
  if (!await validSameOrigin(request)) return fail('Request could not be verified.',403);
  const raw = await request.text(); if (raw.length>4096) return fail('Request too large.',413);
  const data = JSON.parse(raw); const {action}=await context.params;
  const email=normalizeEmail(String(data.email??''));
  if (!['status','reset-request','verify','reset','verify-request','mfa-setup','mfa-confirm','mfa-disable','export','delete'].includes(action)) return fail('Unknown action.',404);
  if (!neonAuthConfigured()) await ensureD1AuthSchema();
  if (action !== 'status') {
   const limit=await takeAuthAttempt(request,`account:${action}`,'');
   if (!limit.allowed) return fail('Too many attempts. Please try again in an hour.',429);
  }
  if (action==='reset-request') {
   if (!emailVerificationConfigured()) return fail('Email delivery is not configured yet.',503);
   const user=neonAuthConfigured()?await neonSecurityRowByEmail(email):await env.DB.prepare('SELECT * FROM community_users WHERE email=?').bind(email).first<SecurityRow>();
   if (user) { try { await sendAccountEmail(user,'reset'); } catch { /* Keep the response indistinguishable from an unknown email. */ } }
   return noStoreJson({message:'If an account matches that email, a reset link has been sent.'});
  }
  if (action==='verify' || action==='reset') {
   const token=String(data.token??''); if (!/^[a-f0-9]{64}$/.test(token)) return fail('Invalid or expired link.');
   if (action==='reset' && (typeof data.password!=='string'||passwordError(data.password))) return fail(typeof data.password==='string'?passwordError(data.password):'Use a password with 12–128 characters.');
   const tokenDigest=digest(token);
   const neonUserId=neonAuthConfigured()?await neonTokenUser(tokenDigest,action):null;
   const record=neonAuthConfigured()?(neonUserId?{user_id:neonUserId}:null):await env.DB.prepare('SELECT user_id FROM account_tokens WHERE token_hash=? AND purpose=? AND expires_at>?').bind(tokenDigest,action,Date.now()).first<{user_id:string}>();
   if (!record) return fail('Invalid or expired link.');
   const password=action==='reset'?await hashPassword(data.password):null;
   if (neonAuthConfigured()) {
    if (password) await completeNeonPasswordReset(record.user_id,tokenDigest,password.hash,password.salt,password.iterations);
    else await completeNeonVerification(record.user_id,tokenDigest);
    const updated=await neonUserById(record.user_id); if(updated) await mirrorCommunityUser(updated,password??undefined);
    return noStoreJson({message:'Completed. Please sign in again.'});
   }
   // Each mutation is conditional on the same still-valid token; D1 batch is atomic.
   const condition='id=(SELECT user_id FROM account_tokens WHERE token_hash=? AND purpose=? AND expires_at>?)';
   const mutation=password?env.DB.prepare(`UPDATE community_users SET password_hash=?,password_salt=?,password_iterations=? WHERE ${condition}`).bind(password.hash,password.salt,password.iterations,digest(token),action,Date.now()):env.DB.prepare(`UPDATE community_users SET email_verified=1 WHERE ${condition}`).bind(digest(token),action,Date.now());
   const results=await env.DB.batch([mutation,env.DB.prepare('DELETE FROM community_sessions WHERE user_id=(SELECT user_id FROM account_tokens WHERE token_hash=? AND purpose=? AND expires_at>?)').bind(digest(token),action,Date.now()),env.DB.prepare('DELETE FROM account_tokens WHERE user_id=(SELECT user_id FROM account_tokens WHERE token_hash=?) AND purpose=?').bind(digest(token),action)]);
   if (!results[0].meta.changes) return fail('Invalid or expired link.');
   return noStoreJson({message:'Completed. Please sign in again.'});
  }
  const session=await getCommunityUser(); if (!session) return fail('Sign in first.',401);
  const user=await accountRow(session.id); if (!user) return fail('Sign in first.',401);
  if (action==='status') return noStoreJson({email:user.email,emailVerified:Boolean(user.email_verified),twoFactorEnabled:Boolean(user.mfa_secret)});
  if (action==='verify-request') { await sendAccountEmail(user,'verify'); return noStoreJson({message:'Verification link sent. Check your email.'}); }
  const password=String(data.password??'');
  if (password.length>128 || !await verifyPassword(password,user.password_salt,user.password_hash,user.password_iterations)) return fail('Credentials could not be verified.',401);
  if (!user.email_verified) return fail('Verify your email first.',403);
  if (!await checkFactor(user,String(data.code??''))) return fail('Authenticator or recovery code is invalid or already used.',401);
  if (action==='mfa-setup') {
   if (user.mfa_secret) return fail('Two-factor authentication is already enabled.');
   const secret=randomBytes(20); const encrypted=await seal(secret.toString('hex'),String(env.AUTH_ENCRYPTION_KEY??''),user.id);
   if(neonAuthConfigured()) await getNeonAuthDb().query('UPDATE auth_users SET mfa_pending=$1 WHERE id=$2 AND mfa_secret IS NULL',[encrypted,user.id]);
   else await env.DB.prepare('UPDATE community_users SET mfa_pending=? WHERE id=? AND mfa_secret IS NULL').bind(encrypted,user.id).run();
   return noStoreJson({secret:base32(secret),message:'Add this setup key to your authenticator, then enter its six-digit code to confirm.'});
  }
  if (action==='mfa-confirm') {
   if (!user.mfa_pending || user.mfa_secret) return fail('Start two-factor setup first.');
   const step=matchingStep(await unseal(user.mfa_pending,String(env.AUTH_ENCRYPTION_KEY??''),user.id),String(data.code??''));
   if (step<0) return fail('Invalid authenticator code.');
   const codes=Array.from({length:10},()=>randomBytes(16).toString('hex'));
   if(neonAuthConfigured()) {
    const sql=getNeonAuthDb();
    const results=await sql.transaction([
     sql.query('UPDATE auth_users SET mfa_secret=mfa_pending,mfa_pending=NULL,mfa_last_step=$1 WHERE id=$2 AND mfa_secret IS NULL AND mfa_pending=$3 RETURNING id',[step,user.id,user.mfa_pending]),
     ...codes.map(code=>sql.query('INSERT INTO auth_recovery_codes(code_hash,user_id) VALUES($1,$2)',[digest(code),user.id])),
     sql.query('DELETE FROM auth_sessions WHERE user_id=$1',[user.id])
    ]);
    if(!(results[0] as unknown[]).length) return fail('Setup changed. Start again.');
   } else {
    const results=await env.DB.batch([
     env.DB.prepare('UPDATE community_users SET mfa_secret=mfa_pending,mfa_pending=NULL,mfa_last_step=? WHERE id=? AND mfa_secret IS NULL AND mfa_pending=?').bind(step,user.id,user.mfa_pending),
     ...codes.map(code=>env.DB.prepare('INSERT INTO recovery_codes(code_hash,user_id) SELECT ?,id FROM community_users WHERE id=? AND mfa_secret=?').bind(digest(code),user.id,user.mfa_pending)),
     env.DB.prepare('DELETE FROM community_sessions WHERE user_id=?').bind(user.id)
    ]);
    if (!results[0].meta.changes) return fail('Setup changed. Start again.');
   }
   return noStoreJson({codes,message:'Two-factor authentication enabled. Save these single-use recovery codes securely. Sign in again.'});
  }
  if (action==='mfa-disable') {
   if(neonAuthConfigured()) { const sql=getNeonAuthDb(); await sql.transaction([sql.query('UPDATE auth_users SET mfa_secret=NULL,mfa_pending=NULL,mfa_last_step=-1 WHERE id=$1',[user.id]),sql.query('DELETE FROM auth_recovery_codes WHERE user_id=$1',[user.id]),sql.query('DELETE FROM auth_sessions WHERE user_id=$1',[user.id])]); }
   else await env.DB.batch([env.DB.prepare('UPDATE community_users SET mfa_secret=NULL,mfa_pending=NULL,mfa_last_step=-1 WHERE id=?').bind(user.id),env.DB.prepare('DELETE FROM recovery_codes WHERE user_id=?').bind(user.id),env.DB.prepare('DELETE FROM community_sessions WHERE user_id=?').bind(user.id)]);
   return noStoreJson({message:'Two-factor authentication disabled. Sign in again.'});
  }
  if (action==='export') {
   const result:Record<string,unknown>={account:{email:user.email,id:user.id,displayName:session.displayName,emailVerified:Boolean(user.email_verified)},exportedAt:new Date().toISOString()};
   for (const table of ['community_posts','community_comments','community_reactions','community_reports']) result[table]=(await env.DB.prepare(`SELECT * FROM ${table} WHERE user_id=?`).bind(user.id).all()).results;
   result.wallSubmissions=(await env.DB.prepare('SELECT * FROM wall_submissions WHERE submitter_email=? COLLATE NOCASE').bind(user.email).all()).results;
   result.corrections=(await env.DB.prepare('SELECT * FROM corrections WHERE submitter_email=? COLLATE NOCASE').bind(user.email).all()).results;
   const media=await env.DB.prepare('SELECT media_key AS key FROM community_posts WHERE user_id=? AND media_key IS NOT NULL UNION SELECT image_key AS key FROM wall_submissions WHERE submitter_email=? COLLATE NOCASE').bind(user.id,user.email).all<{key:string}>();
   const encoder=new TextEncoder();
   const stream=new ReadableStream({async start(controller){try{
    controller.enqueue(encoder.encode(JSON.stringify(result).slice(0,-1)+',"uploadedFiles":['));
    let first=true;
    for(const row of media.results){if(!row.key)continue;const object=await env.BUCKET.get(row.key);if(!object)throw new Error('Uploaded file unavailable');
     controller.enqueue(encoder.encode((first?'':',')+JSON.stringify({key:row.key,contentType:object.httpMetadata?.contentType,base64:Buffer.from(await object.arrayBuffer()).toString('base64')})));first=false;}
    controller.enqueue(encoder.encode(']}'));controller.close();
   }catch(error){controller.error(error);}}});
   return new Response(stream,{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Content-Disposition':'attachment; filename="cia-guide-account.json"'}});
  }
  if (action==='delete') {
   if (data.confirmation!=='DELETE MY ACCOUNT') return fail('Type DELETE MY ACCOUNT to confirm.');
   const media=await env.DB.prepare('SELECT media_key AS key FROM community_posts WHERE user_id=? AND media_key IS NOT NULL UNION SELECT image_key AS key FROM wall_submissions WHERE submitter_email=? COLLATE NOCASE').bind(user.id,user.email).all<{key:string}>();
   // Delete objects first. On storage failure the account remains so deletion can be retried.
   for (const row of media.results) if(row.key) await env.BUCKET.delete(row.key);
   await ensureD1AuthSchema();
   await env.DB.batch([env.DB.prepare('DELETE FROM wall_submissions WHERE submitter_email=? COLLATE NOCASE').bind(user.email),env.DB.prepare('DELETE FROM corrections WHERE submitter_email=? COLLATE NOCASE').bind(user.email),env.DB.prepare('DELETE FROM community_users WHERE id=?').bind(user.id)]);
   if(neonAuthConfigured()) await getNeonAuthDb().query('DELETE FROM auth_users WHERE id=$1',[user.id]);
   await clearSession(); return noStoreJson({message:'Your account and associated submissions have been deleted.'});
  }
  return fail('Unknown action.',404);
 } catch { return fail('Account service is unavailable. Please try again later.',503); }
}
