# WendellRowe.com — Rowe Meridian Group℠

A high-end, responsive personal executive website built as a dependency-free static site.

## Preview locally

Open `index.html` directly, or run:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy to Cloudflare Workers

1. Install Node.js LTS.
2. Run `npm install`.
3. Authenticate Wrangler with `npx wrangler login`.
4. From the repository root, run `npm run deploy`.
5. Keep `wendellrowe.com` and `www.wendellrowe.com` attached to the `wendellrowe-site` Worker in Cloudflare.

## Filling records

Draft operating copy is on the page so the structure reads finished. Swap any figure, year, or story line the moment your records differ. Portrait remains a monogram plate until a photograph is supplied.


- Confirm the current-title wording in the Executive Path section.
- Replace `hello@wendellrowe.com` in `index.html` if a different inbox is preferred.
- The site intentionally avoids personal residence and family details.
- Do not add confidential employer information or unverified performance claims.

## Files

- `index.html` — structure and copy
- `styles.css` — visual system and responsive layout
- `script.js` — interactions, animations, canvas background
- `assets/crest.svg` — custom Rowe Meridian Group℠ crest
- `assets/wr-monogram.svg` — WR monogram
- `assets/favicon.svg` — browser icon
- `assets/og-card.svg` — social sharing image
- `wrangler.jsonc` — Cloudflare Workers static-assets configuration
- `package.json` — pinned Wrangler tooling and deployment scripts
## Deployment status

Cloudflare automatically deploys the production Worker from the `main` branch.

## Inquiry delivery

The contact form submits to the Worker endpoint at `/api/inquiry`. Delivery uses [Cloudflare Email Service](https://developers.cloudflare.com/email-service/) via a native `send_email` binding — no API keys or third-party services required.

### One-time setup

1. In the Cloudflare dashboard, go to **Compute** > **Email Service** > **Email Sending** and onboard `wendellrowe.com`.
2. Verify the destination address `hello@wendellrowe.com` under **Email Routing** > **Destination Addresses**.
3. Redeploy the Worker (or push to `main` for auto-deploy).

Messages are delivered to `hello@wendellrowe.com` with the visitor's name, organization, email, and message. If the email binding is not yet configured, the form keeps the visitor's message and offers an explicit Open email draft link.

After activation, send a clearly labelled test through the production form and confirm receipt at `hello@wendellrowe.com`. A successful HTTP response alone is not an inbox-delivery test.


## Site structure

The homepage presents the introduction, selected career results, a concise profile, executive path, firm engagements, and contact. The complete biography is available at `/bio`; its PDF link uses the asset’s exact filename. Section numbers follow the page order. The personal birth-year reference is labelled Born, while the firm crest uses the firm name.

## Remaining delivery activation

Production currently needs Cloudflare Email Service enabled for `wendellrowe.com` and the destination address `hello@wendellrowe.com` verified in Email Routing. Enable both in the Cloudflare dashboard under **Compute** > **Email Service**.

The career metrics retain their previously published context; employer and role attribution should be added only when Wendell confirms those details.
