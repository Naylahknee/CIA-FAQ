/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://media.giphy.com",
  "script-src 'self' 'unsafe-inline' https://accounts.google.com https://cdn.tailwindcss.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
  "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
  "connect-src 'self' https://accounts.google.com",
  "frame-src 'self' https://accounts.google.com",
  "upgrade-insecure-requests",
].join("; ");

function secure(response: Response, request: Request) {
  const secured = new Response(response.body, response);
  secured.headers.set("x-content-type-options", "nosniff");
  secured.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  // SAMEORIGIN rather than DENY, matching frame-ancestors above: the
  // celebration wall is embedded by /wall on this same origin.
  secured.headers.set("x-frame-options", "SAMEORIGIN");
  secured.headers.set("content-security-policy", contentSecurityPolicy);
  secured.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  secured.headers.set("cross-origin-opener-policy", "same-origin");
  if (new URL(request.url).protocol === "https:") secured.headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  return secured;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.protocol !== "https:") {
      url.protocol = "https:";
      return Response.redirect(url, 308);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const imageResponse = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return secure(imageResponse, request);
    }

    try {
      return secure(await handler.fetch(request, env, ctx), request);
    } catch (error) {
      console.error("Unhandled worker request", error);
      const unavailable = url.pathname.startsWith("/api/")
        ? Response.json({ error: "Service temporarily unavailable." }, { status: 503, headers: { "cache-control": "no-store" } })
        : new Response("Service temporarily unavailable.", { status: 503 });
      return secure(unavailable, request);
    }
  },
};

export default worker;
