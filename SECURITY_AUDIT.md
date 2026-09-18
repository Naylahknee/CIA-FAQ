# Community authentication and API audit

Code review date: 2026-09-18. This is a source-code and build review, not an external penetration test.

## Authentication findings

| Severity | Finding | Exact remediation |
| --- | --- | --- |
| High | Passwords are salted PBKDF2-SHA-256 hashes, not plaintext, but this does **not** meet the required bcrypt/scrypt/Argon2 standard. | Make Neon required for email/password authentication. In the Neon migration run `CREATE EXTENSION IF NOT EXISTS pgcrypto;`; replace `hashPassword`/`verifyPassword` calls with `crypt($1, gen_salt('bf', 12))` and `crypt($1, password_hash) = password_hash`. Store only the bcrypt string in `auth_credentials.password_hash`; remove the salt and iteration columns after migration. Disable D1 email/password sign-up rather than silently falling back to PBKDF2. |
| Medium | Email verification is optional when Resend environment variables are not configured, so an unverified password account can interact with the group. | Configure `RESEND_API_KEY`, `AUTH_EMAIL_FROM`, and `APP_ORIGIN`; then change `requireCommunityUser` to reject every unverified password account. In production, return 503 from `/api/community/auth/signup` when email delivery is unavailable. Google accounts may be considered verified only after Google JWT verification succeeds. |
| Medium | Account tokens are opaque, server-hashed cookies, not JWTs. This is safer than a browser JWT, but the prior seven-day lifetime exceeded the requested maximum. | Fixed in this change: `SESSION_DAYS` is now `1`; the cookie and server record expire after 24 hours. |
| Pass | No plaintext password storage found. | Keep password values out of logs, responses, and exports. |
| Pass | Sign-in, sign-up, Google sign-in, and account actions have server-side rate limits. | Keep Cloudflare/WAF rate limits in front of these routes for distributed attacks. |
| Pass | Logout deletes the hashed server-side session record and expires the `HttpOnly`, `Secure`, `SameSite=Strict` cookie. | Keep this server-side revocation behavior; do not replace it with an unrevocable JWT-only session. |
| Pass | Password reset expires in 30 minutes; email verification expires in 60 minutes. Tokens are hashed at rest and are one-time use. | Preserve the current expiry checks and invalidation of existing sessions after reset. |
| Pass | State-changing auth requests require a same-origin `Origin` header. | Retain this check; add a per-form CSRF token only if cross-origin form submission or a separate frontend origin is introduced. |

## API authorization review

| Endpoint | Current authorization status | Fix / required control |
| --- | --- | --- |
| `GET/POST /api/community/posts` | Authenticated, verified user required. POST is same-origin and rate-limited. Posts are owned by server session user, not client input. | Keep topic lookup and media checks. Anonymous responses hide another member's user ID. |
| `DELETE /api/community/posts/:id` | Owner-only lookup prevents horizontal deletion. | Add a separate moderator removal route if moderators need to act without impersonating owners; keep an audit trail. |
| `POST /api/community/posts/:id/comments` | Authenticated, verified user; post existence verified; comment author comes from session. | Fixed: comment rate limit added. Consider rejecting comments on removed posts explicitly. |
| `POST /api/community/posts/:id/reactions` | Authenticated, verified user; unique `(post,user)` reaction prevents acting as another user. | Add a published-post existence check before insert to avoid orphaned reactions on removed/nonexistent posts. |
| `POST /api/community/posts/:id/report` | Authenticated, verified user; report author comes from session. | Add a published-post existence check and rate limit to reduce spam. |
| `GET /api/community/media/:id` | Authenticated, verified user; only published media is served. | Intended group-wide access. Keep `nosniff` and no-store headers. |
| `GET/POST /api/community/topics` | Authenticated, verified user; POST is same-origin and rate-limited; creator is server session user. | New in this change. Add moderator archive UI before allowing topic clean-up. |
| `POST /api/community/auth/signup` | Public by design; same-origin, input validation, IP rate limit. | Make email verification mandatory and replace PBKDF2 with bcrypt via Neon before treating as high-assurance auth. |
| `POST /api/community/auth/signin` | Public by design; same-origin, per-IP/email rate limit, password and MFA checks. | Replace PBKDF2 verification with bcrypt via Neon. |
| `POST /api/community/auth/google` | Public by design; same-origin, rate-limited, verifies Google JWT signature, issuer, audience, algorithm, and verified email. | Keep Neon mandatory; do not accept client-provided profile data without JWT verification. |
| `POST /api/community/auth/signout` | Same-origin; revokes only caller's presented session. | No change required. |
| `GET /api/community/auth/me` | Returns only current session user; no object ID accepted. | No change required. |
| `GET /api/community/auth/providers` | Public configuration metadata only. | Keep response limited to public client IDs. |
| `POST /api/community/account/:action` | Same-origin. Status/MFA/export/delete require current session and password/MFA reauthentication; reset/verify use expiring hashed tokens. | Require configured email verification in production; keep action allow-list and size limit. |
| `GET/POST /api/submissions` | GET exposes approved wall items only. POST is intentionally public, same-origin, and requires consent. | Add a public submission rate limiter and Cloudflare Turnstile before opening the site broadly. |
| `GET /api/media/:id` | Public only for approved wall submissions. | Keep approval status check and content type allow-list. |
| `POST /api/corrections` | Intentionally public, same-origin. | Add rate limiting and Turnstile to prevent spam; no sensitive resource is exposed. |
| `GET /api/faqs/community` | Public read-only published FAQ data. | No change required. |
| `POST /api/groupme/callback` | Protected by a secret, expected group ID, strict content type/size validation, and duplicate ID constraint. | Add a Cloudflare rate limit and rotate the webhook secret if it was ever disclosed. |
| `POST /api/admin/faq-suggestions` | Requires same-origin, verified session, then moderator role or configured admin email. | Keep role check server-side; add explicit audit logging for publication changes. |
| `POST /api/admin/submissions` | Requires same-origin, verified session, then moderator role or configured admin email. | Keep role check server-side; add explicit audit logging for approvals/rejections. |

## Scope note

This delivers Facebook-group-style building blocks: topic-based discussion, original posts, anonymous posts, photos, GIFs, reactions, comments, reports, account controls, and moderation-aware identity handling. It intentionally does not claim to replicate Facebook's private messaging, events, livestreaming, marketplace, friend graph, or notification infrastructure.

## Deployment and dependency review (2026-09-18)

| Check | Result | Action |
| --- | --- | --- |
| HTTPS and certificate | HTTPS is active through Cloudflare with a valid TLS response. | The Worker now redirects HTTP requests to HTTPS with a 308 redirect. |
| Security headers | `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and a CSP are returned. | CSP was expanded to include `default-src`, script, image, font, connection, form, and frame controls. |
| Debug/source maps | Production build has no `.map` files; inspector port is disabled. | `build.sourcemap` is explicitly `false`. |
| Error details | API routes return generic client errors; the Worker now returns a generic 503 for unhandled exceptions. | Keep detailed errors in private Cloudflare logs only. |
| Deployment reproducibility | The workflow previously used `npm install --no-package-lock`. | Fixed to `npm ci --no-audit --no-fund`; `package-lock.json` is authoritative in CI. |
| Secrets | Secrets use GitHub Actions secrets and Cloudflare Worker secrets; no literal credential was found. | Keep public configuration in GitHub variables and private values in secrets only. |
| Dependency vulnerabilities | `npm audit --omit=dev` found 0 vulnerabilities. Full audit found 14 development/build-tool advisories, including `vite`, `vinext`, `wrangler`, `react-server-dom-webpack`, and transitive `undici`, `ws`, `sharp`, and `image-size`. | Update the Vinext/Cloudflare build toolchain together once compatible patched versions are available; do not force isolated transitive overrides without verifying deployment compatibility. |

The dependency manifest contains a number of unused starter packages: `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx`, `cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `next-themes`, `radix-ui`, `react-day-picker`, `react-hook-form`, `react-resizable-panels`, `recharts`, `sonner`, `tailwind-merge`, `vaul`, and `zod`. They are legitimate npm packages, but removing unreferenced packages reduces supply-chain surface and install size.
