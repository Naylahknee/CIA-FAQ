import { env } from 'cloudflare:workers';
import { digest, matchingStep, randomToken, unseal } from './security-crypto';
export type SecurityRow = { id:string; email:string; email_verified:number; mfa_secret:string|null; mfa_pending:string|null; password_hash:string; password_salt:string; password_iterations:number };
export const accountRow = (id:string) => env.DB.prepare('SELECT * FROM community_users WHERE id=?').bind(id).first<SecurityRow>();
export async function checkFactor(user:SecurityRow, code:string) {
  if (!user.mfa_secret) return true;
  if (/^[a-f0-9]{32}$/.test(code)) {
    const result = await env.DB.prepare('DELETE FROM recovery_codes WHERE user_id=? AND code_hash=? RETURNING code_hash').bind(user.id,digest(code)).first();
    return Boolean(result);
  }
  const step = matchingStep(await unseal(user.mfa_secret,String(env.AUTH_ENCRYPTION_KEY ?? ''),user.id),code);
  if (step < 0) return false;
  return Boolean(await env.DB.prepare('UPDATE community_users SET mfa_last_step=? WHERE id=? AND mfa_last_step < ? RETURNING id').bind(step,user.id,step).first());
}
export async function sendAccountEmail(user:SecurityRow, purpose:'verify'|'reset') {
  const origin = new URL(String(env.APP_ORIGIN ?? ''));
  if (origin.protocol !== 'https:' || !env.RESEND_API_KEY || !env.AUTH_EMAIL_FROM) throw new Error('Email configuration missing');
  const token = randomToken();
  await env.DB.prepare('DELETE FROM account_tokens WHERE user_id=? AND purpose=?').bind(user.id,purpose).run();
  await env.DB.prepare('INSERT INTO account_tokens(token_hash,user_id,purpose,expires_at) VALUES(?,?,?,?)').bind(digest(token),user.id,purpose,Date.now()+(purpose==='reset'?30:60)*60000).run();
  const link = `${origin.origin}/account#${purpose}=${token}`;
  const result = await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:env.AUTH_EMAIL_FROM,to:[user.email],subject:purpose==='verify'?'Verify your CIA Guide email':'Reset your CIA Guide password',text:`${purpose==='verify'?'Verify your email':'Reset your password'}: ${link}\nThis link expires in ${purpose==='reset'?30:60} minutes. If you did not request it, ignore this email.`})});
  if (!result.ok) { await env.DB.prepare('DELETE FROM account_tokens WHERE token_hash=?').bind(digest(token)).run(); throw new Error('Email delivery failed'); }
}
