# Happy Everything

Happy Everything has been retired. This repository now serves a single static
landing page that directs visitors to [Infinity List](https://infinity-list.com),
where they can keep creating and sharing gift lists.

## What's here

A self-contained static site — no build step, no backend, no external services.

```
index.html        # the landing page (all CSS inline)
assets/           # logo + local fonts
favicon.*         # icons
manifest.json
robots.txt
open-graph.png
```

## Local preview

Serve the folder with any static server, e.g.:

```
npx serve .
```

## Deploy (Cloudflare Pages)

The repo root is the publish directory, so it deploys as-is:

```
wrangler pages deploy . --project-name happyeverything
```

Or connect the repo in the Cloudflare Pages dashboard with:

- Build command: _(none)_
- Build output directory: `/`
