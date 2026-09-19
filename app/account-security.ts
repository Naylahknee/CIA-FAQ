import { env } from 'cloudflare:workers';
import { digest, matchingStep, randomToken, unseal } from './security-crypto';
import { deleteNeonAccountToken, getNeonAuthDb, neonAuthConfigured, neonSecurityRowById, storeNeonAccountToken } from './neon-auth';
import { ensureD1AuthSchema } from './community-auth-schema';
export type SecurityRow = { id:string; email:string; email_verified:number; mfa_secret:string|null; mfa_pending:string|null; password_hash:string; password_salt:string; password_iterations:number };
export const accountRow = async (id:string) => {
  if (neonAuthConfigured()) return neonSecurityRowById(id);
  await ensureD1AuthSchema();
  return env.DB.prepare('SELECT * FROM community_users WHERE id=?').bind(id).first<SecurityRow>();
};
export async function checkFactor(user:SecurityRow, code:string) {
  if (!user.mfa_secret) return true;
  if (/^[a-f0-9]{32}$/.test(code)) {
    const result = neonAuthConfigured()
      ? (await getNeonAuthDb().query('DELETE FROM auth_recovery_codes WHERE user_id=$1 AND code_hash=$2 RETURNING code_hash',[user.id,digest(code)]))[0]
      : await env.DB.prepare('DELETE FROM recovery_codes WHERE user_id=? AND code_hash=? RETURNING code_hash').bind(user.id,digest(code)).first();
    return Boolean(result);
  }
  const step = matchingStep(await unseal(user.mfa_secret,String(env.AUTH_ENCRYPTION_KEY ?? ''),user.id),code);
  if (step < 0) return false;
  if (neonAuthConfigured()) return Boolean((await getNeonAuthDb().query('UPDATE auth_users SET mfa_last_step=$1 WHERE id=$2 AND mfa_last_step < $1 RETURNING id',[step,user.id]))[0]);
  return Boolean(await env.DB.prepare('UPDATE community_users SET mfa_last_step=? WHERE id=? AND mfa_last_step < ? RETURNING id').bind(step,user.id,step).first());
}
/** Cloudflare Email Service's Workers binding. It is declared in the deploy
 *  workflow as `send_email: [{ name: "EMAIL" }]` and is not part of the
 *  generated worker types, so the shape we rely on is stated here. */
type EmailBinding = {
  send(message:{ to:string; from:string; subject:string; text:string; html?:string }):Promise<{ messageId?:string }>;
};
const emailBinding = () => (env as unknown as { EMAIL?:EmailBinding }).EMAIL;

export async function sendAccountEmail(user:SecurityRow, purpose:'verify'|'reset') {
  // Mail goes out through Cloudflare Email Service rather than a third-party
  // API, so there is no key to hold: the binding is authorised by belonging to
  // this Worker. The sending domain is authorised by the SPF, DKIM and DMARC
  // records added when the domain is onboarded in the Cloudflare dashboard --
  // without that onboarding, send() fails no matter what this code does.
  const origin = new URL(String(env.APP_ORIGIN ?? ''));
  const sender = emailBinding();
  const from = String(env.AUTH_EMAIL_FROM ?? '').trim();
  // Name the missing piece: this error surfaces in logs, and "configuration
  // missing" on its own cost a day of guessing once already.
  if (origin.protocol !== 'https:') throw new Error('Email configuration missing: APP_ORIGIN must be an https origin');
  if (!sender) throw new Error('Email configuration missing: the EMAIL binding is not attached to this Worker');
  if (!from) throw new Error('Email configuration missing: AUTH_EMAIL_FROM is not set');

  const token = randomToken();
  const tokenDigest = digest(token);
  const minutes = purpose === 'reset' ? 30 : 60;
  if (neonAuthConfigured()) await storeNeonAccountToken(user.id,purpose,tokenDigest,new Date(Date.now()+minutes*60000));
  else {
    await ensureD1AuthSchema();
    await env.DB.prepare('DELETE FROM account_tokens WHERE user_id=? AND purpose=?').bind(user.id,purpose).run();
    await env.DB.prepare('INSERT INTO account_tokens(token_hash,user_id,purpose,expires_at) VALUES(?,?,?,?)').bind(tokenDigest,user.id,purpose,Date.now()+minutes*60000).run();
  }

  const link = `${origin.origin}/account#${purpose}=${token}`;
  const heading = purpose === 'verify' ? 'Verify your email' : 'Reset your password';
  const subject = purpose === 'verify' ? 'Verify your CIA Guide email' : 'Reset your CIA Guide password';
  const text = `${heading}: ${link}\nThis link expires in ${minutes} minutes. If you did not request it, ignore this email.`;
  try {
    // send() rejects on failure, where the previous provider returned a
    // non-ok response, so the token cleanup moves into a catch.
    await sender.send({
      to: user.email,
      from,
      subject,
      text,
      html: `<p>${heading}: <a href="${link}">${link}</a></p><p>This link expires in ${minutes} minutes. If you did not request it, ignore this email.</p>`,
    });
  } catch (cause) {
    // Every caller of this function swallows the failure so that signup and
    // password reset stay indistinguishable for an unknown address. That is
    // right for the response, and useless for an operator: mail silently does
    // not arrive and nothing anywhere says why. The Worker has observability
    // enabled, so record the real reason where it can be read in Cloudflare's
    // Workers logs, without leaking it to the caller.
    console.error('sendAccountEmail failed', {
      purpose,
      from,
      // The recipient's domain is enough to spot a pattern; the full address
      // is not logged.
      toDomain: user.email.split('@')[1] ?? 'unknown',
      cause: cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause),
    });
    // A token that was never delivered must not stay valid.
    if (neonAuthConfigured()) await deleteNeonAccountToken(tokenDigest);
    else await env.DB.prepare('DELETE FROM account_tokens WHERE token_hash=?').bind(tokenDigest).run();
    throw new Error('Email delivery failed');
  }
}
