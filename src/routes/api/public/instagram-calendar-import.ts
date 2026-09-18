import { createHmac, timingSafeEqual } from "crypto";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/instagram-calendar-import")({
  server: { handlers: { POST: async ({ request }) => {
    const secret = process.env["LOVABLE_CRON_SECRET"];
    const signature = request.headers.get("x-cron-signature") ?? "";
    const timestamp = request.headers.get("x-cron-timestamp") ?? "";
    if (!secret || !signature || !timestamp || Math.abs(Date.now() - Number(timestamp)) > 300000) return new Response("Unauthorized", { status: 401 });
    const expected = createHmac("sha256", secret).update(timestamp).digest("hex");
    const suppliedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return new Response("Unauthorized", { status: 401 });
    const { importInstagramEvents } = await import("@/lib/instagram-import.server");
    return Response.json(await importInstagramEvents());
  } } },
});