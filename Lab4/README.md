# GreenSense — Lab 4 (SSG + Git CMS)

Lab 4 migrates the GreenSense landing page to a static site generator and makes most of its content editable through a Git-based CMS.

## Stack

- **SSG:** Eleventy (11ty)
- **CMS:** Decap CMS (Git-based)
- **Styling:** Existing `Lab3` CSS (`reset.css`, `style.css`) + Bootstrap CDN

## Project structure

- `src/index.njk` — page template
- `src/content/site.json` — main editable content model
- `src/admin/` — Decap CMS admin app and config
- `src/assets/` — copied style/image assets from Lab 3
- `dist/` — generated output

## Run locally

```bash
cd Lab4
npm install
npm run dev
```

Build only:

```bash
cd Lab4
npm run build
```

## CMS editing

1. Start local server with `npm run dev`
2. Open `/admin/`
3. Edit entries under **Site Content**
4. Save/publish changes (commit to repo through CMS)

Most text content is editable from `site.json` through the CMS, including:
- navigation
- hero section
- products
- features
- about block and stats
- testimonials
- contact info cards and subjects
- footer links
- mascot message

## Deployment

GitHub Actions workflow: `.github/workflows/lab4-pages.yml`

- Builds the Eleventy project from `Lab4/`
- Publishes `Lab4/dist` to GitHub Pages

After enabling GitHub Pages for the repository (source: GitHub Actions), the live URL is available in the workflow deployment output.
