# Turnstile-protect the contact form and replace the resume

## Build
- Add a Cloudflare Turnstile challenge to the existing contact form.
- Route submissions through a TanStack server endpoint. Validate bounded form fields, verify the CAPTCHA token with Cloudflare Siteverify on the server, and forward only verified submissions to Web3Forms.
- Keep clear success and error states, reject submissions without a valid challenge, and keep provider keys out of browser code.
- Replace the current downloadable resume PDF with the newly uploaded `Ankit_Sharma.pdf` at the existing download address.

## Technical details
- Serve the public Turnstile site key from a server endpoint; read Turnstile and Web3Forms keys only inside the POST handler.
- Check Turnstile success, expected action, and request hostname before forwarding a message.
- Store the required service values through Lovable's secure secret form after the server route is in place.
- Verify the download path and contact form states, then check the preview build.