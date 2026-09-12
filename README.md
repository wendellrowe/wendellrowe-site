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

Draft operating copy is on the page so the structure reads finished. Swap any figure, year, or story line the moment your records differ. Portrait remains a monogram plate until a photograph is supplied.


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
