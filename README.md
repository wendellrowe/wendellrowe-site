# WendellRowe.com — Rowe Meridian Group®

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

Placeholder copy is marked `records to be entered` and wrapped in `[brackets]`. Replace those lines with cleared figures and facts. Send a portrait when you have it and it will replace the monogram plate. LinkedIn and calendar buttons are in the contact section; point their `href` at your URLs and remove `aria-disabled`.


- Confirm the current-title wording in the Executive Path section.
- Replace `hello@wendellrowe.com` in `index.html` if a different inbox is preferred.
- The site intentionally avoids personal residence and family details.
- Do not add confidential employer information or unverified performance claims.

## Files

- `index.html` — structure and copy
- `styles.css` — visual system and responsive layout
- `script.js` — interactions, animations, canvas background
- `assets/crest.svg` — custom Rowe Meridian Group® crest
- `assets/wr-monogram.svg` — WR monogram
- `assets/favicon.svg` — browser icon
- `assets/og-card.svg` — social sharing image
- `wrangler.jsonc` — Cloudflare Workers static-assets configuration
- `package.json` — pinned Wrangler tooling and deployment scripts
## Deployment status

Cloudflare automatically deploys the production Worker from the `main` branch.
