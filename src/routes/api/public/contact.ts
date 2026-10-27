import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10).max(2000),
  turnstileToken: z.string().min(1).max(2048),
  botcheck: z.string().max(200).optional(),
}).strict();

const turnstileResultSchema = z.object({
  success: z.boolean(),
  hostname: z.string().optional(),
  action: z.string().optional(),
});

const providerResultSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

const jsonError = (error: string, status: number) => Response.json({ error }, { status });

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      GET: async () => {
        const siteKey = process.env["TURNSTILE_SITE_KEY"];
        if (!siteKey) return jsonError("Contact verification is not configured.", 503);
        return Response.json({ siteKey });
      },
      POST: async ({ request }) => {
        const turnstileSecret = process.env["TURNSTILE_SECRET_KEY"];
        const web3FormsKey = process.env["WEB3FORMS_ACCESS_KEY"];
        if (!turnstileSecret || !web3FormsKey) {
          return jsonError("Contact form is not configured yet.", 503);
        }

        if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
          return jsonError("Please submit a valid contact message.", 415);
        }
        const contentLength = Number(request.headers.get("content-length") ?? 0);
        if (contentLength > 10_000) return jsonError("Your message is too large.", 413);

        let rawBody: unknown;
        try {
          const bodyText = await request.text();
          if (bodyText.length > 10_000) return jsonError("Your message is too large.", 413);
          rawBody = JSON.parse(bodyText);
        } catch {
          return jsonError("Please submit a valid contact message.", 400);
        }

        const parsed = contactSchema.safeParse(rawBody);
        if (!parsed.success) return jsonError("Please check the contact form fields and try again.", 400);
        const { name, email, subject, message, turnstileToken, botcheck } = parsed.data;
        if (botcheck) return Response.json({ success: true });

        const expectedHostname = new URL(request.url).hostname;
        let verificationResponse: Response;
        try {
          verificationResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken }),
          });
        } catch {
          return jsonError("Security check is temporarily unavailable. Please try again.", 502);
        }

        if (!verificationResponse.ok) {
          return jsonError("We couldn't verify the security check. Please try again.", 502);
        }

        let verificationBody: unknown;
        try {
          verificationBody = await verificationResponse.json();
        } catch {
          return jsonError("We couldn't verify the security check. Please try again.", 502);
        }

        const verification = turnstileResultSchema.safeParse(verificationBody);
        if (
          !verification.success ||
          !verification.data.success ||
          verification.data.action !== "contact" ||
          verification.data.hostname !== expectedHostname
        ) {
          return jsonError("Security check failed or expired. Please complete it again.", 403);
        }

        let deliveryResponse: Response;
        try {
          deliveryResponse = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              access_key: web3FormsKey,
              name,
              email,
              subject: `Portfolio contact: ${subject}`,
              message,
              from_name: "Portfolio Contact Form",
              replyto: email,
            }),
          });
        } catch {
          return jsonError("Your message couldn't be delivered just now. Please try again.", 502);
        }

        if (!deliveryResponse.ok) return jsonError("Your message couldn't be sent. Please try again.", 502);

        let deliveryBody: unknown;
        try {
          deliveryBody = await deliveryResponse.json();
        } catch {
          return jsonError("Your message couldn't be sent. Please try again.", 502);
        }

        const delivery = providerResultSchema.safeParse(deliveryBody);
        if (!delivery.success || !delivery.data.success) {
          return jsonError("Your message couldn't be sent. Please try again.", 502);
        }

        return Response.json({ success: true });
      },
    },
  },
});