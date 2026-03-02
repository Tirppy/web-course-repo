# Lab 4 - Static Site Generator & Git CMS

The client wants to modernize the landing page infrastructure for better content management and developer experience.

## Customer requirements

- Migrate landing page to a Static Site Generator (SSG)
- Integrate a Git-based CMS for content editing
- Ensure CSS framework from Lab 3 is properly integrated

## Dev requirements

- Choose any SSG (no frontend frameworks like React/Vue required):
  - [Astro](https://astro.build/)
  - [Hugo](https://gohugo.io/)
  - [11ty (Eleventy)](https://www.11ty.dev/)
  - [Jekyll](https://jekyllrb.com/)

- Choose any free Git-based CMS:
  - [TinaCMS](https://tina.io/)
  - [Decap CMS](https://decapcms.org/)
  - [Front Matter CMS](https://frontmatter.codes/) (VS Code extension)
  - [Sveltia CMS](https://github.com/sveltia/sveltia-cms)
  - [Keystatic](https://keystatic.com/)

- As much content as possible should be editable via the CMS
- The site should be deployed live
- Have a decent git history

## Links

- https://www.cloudflare.com/learning/performance/static-site-generator/
- https://jamstack.org/generators/
- https://jamstack.org/headless-cms/

## How to showcase the Decap Admin panel (demo guide)

### 1) Start local demo environment

Run these in two terminals from `Lab4`:

```bash
npm run dev
```

```bash
npx decap-server
```

Then open: `http://localhost:8080/admin/#/`

### 2) What to show in the CMS

- Open **Site Content** → **Landing Page Content**
- Briefly scroll through editable groups:
  - Meta, Navigation, Hero
  - Mobile Tip, Products, Features
  - About, Testimonials, Contact
  - Footer, Mascot
- Edit 1-2 obvious fields (example: Hero title and Mascot CTA label)
- Save/Publish

### 3) What to show on the site

- Open `http://localhost:8080/`
- Refresh and show that edited text appears on the landing page
- Mention that content is stored in `src/content/site.json` and rendered by Eleventy templates

### 4) If fields appear empty in admin

- Hard refresh admin page (`Ctrl + F5`)
- Confirm CMS config uses repo-root paths:
  - `Lab4/src/content/site.json`
  - `Lab4/src/assets/img/uploads`
- Ensure both local processes are running: `npm run dev` and `npx decap-server`
