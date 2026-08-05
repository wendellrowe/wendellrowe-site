# Before you deploy

Run this from the repo root — it must return nothing:

```bash
grep -rn "FILL_" index.html
```

While any `FILL_` remains, that element renders with a red dashed outline in the
browser. That's deliberate. Nothing ships silently half-finished.

---

## Proof band (`#impact`) — the four headline numbers

| Placeholder | What goes here |
|---|---|
| `FILL_METRIC_1` / `FILL_LABEL_1` | e.g. a headcount figure + "people led across N sites" |
| `FILL_METRIC_2` / `FILL_LABEL_2` | e.g. budget or spend under management |
| `FILL_METRIC_3` / `FILL_LABEL_3` | e.g. units shipped, revenue supported, throughput |
| `FILL_METRIC_4` / `FILL_LABEL_4` | e.g. years in operations leadership |

Keep the metric short enough to read at a glance — `$400M`, `1,200+`, `18%`.
The label is the context, in small caps underneath.

## Impact cards — one concrete result each

`FILL_RESULT_1/2/3` sit under the existing abstract description, separated by a
rule. One sentence, past tense, with a number in it. Format that works:

> Consolidated four distribution nodes into two, cutting fulfillment cost 18%
> while holding service level above 99%.

If you can only write one of these honestly, delete the other two `<p class="impact-proof">`
lines rather than padding them.

## Experience timeline

| Placeholder | What goes here |
|---|---|
| `FILL_SCOPE_AMAT` | One line of scope for the Applied Materials role — team size, function, region |
| `FILL_DATES_VP` | Real year range, e.g. `2019 — 2025` |
| `FILL_COMPANY_VP` | The actual employer name |
| `FILL_SCOPE_VP` | Scope + the single biggest outcome |
| `FILL_DATES_EARLY` / `FILL_TITLE_EARLY` / `FILL_COMPANY_EARLY` / `FILL_SCOPE_EARLY` | The earlier role that shows you came up through the operation |

The old "Foundation / Built Across the Operation" entry is gone — it read as a
gap. Replace it with the real early role.

`FILL_DEGREE` / `FILL_INSTITUTION` are in the new credentials list below the
timeline, alongside the Six Sigma Green Belt. If there's no degree you want
listed, delete that whole `<li>`.

## Contact and identity

| Placeholder | What goes here |
|---|---|
| `FILL_LINKEDIN_URL` | Your LinkedIn profile URL — appears in 3 places: JSON-LD `sameAs`, contact block, footer |
| `FILL_CV_PATH` | e.g. `assets/wendell-rowe-cv.pdf` — add the file to `assets/`, or delete the link |

The LinkedIn URL in `sameAs` is what lets Google tie this domain to your
professional identity. It's the highest-value single edit on this list.

---

## Still worth doing (not code)

- **A photograph.** There's still no picture of you anywhere on the site. The
  crest is standing in for a face. A single well-lit portrait in the profile
  section would do more for credibility than any markup change here.
- **Trim the heraldry.** The motto still appears three times (hero sigil,
  profile quote, footer). Cutting it to once — the footer — makes the remaining
  instance land harder.
