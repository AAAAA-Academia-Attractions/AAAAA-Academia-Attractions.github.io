# AAAAA Lab website

GitHub Pages site for AAAAA Lab: **Advanced · Analytical · Adaptive · Adventurous · Aspiring**.

Shared look and feel lives in `assets/css/site.css`, `assets/js/site.js`, and `_includes/`. Visual tokens are documented in `brand-spec.md`.

## Content model

```text
Nav: Home · People · Research · Publication · Projects

Research hierarchy:  main area  →  sub-area Markdown  →  projects
Projects:            on-going `_projects/*.md`  +  published `projects/<slug>/index.html`
People:              `_people/*.md`  →  Home / People cards  →  `/people/<slug>/`  →  optional `website`
```

- **On-going projects** use the shared Markdown layout and URLs `/projects/<slug>/`.
- **Published projects** are free HTML. YAML is only for directories (Projects, Research, Publication, homepage ticker).
- **People intros** are Markdown in `_people/`. Portraits always open that page. A `website` field is linked from the intro, not from the card.
- Research area pages pull related work by `research_area_slug`.
- Publication and the homepage ticker list pages with `status: published` and `listed: true`, newest `date` first.

## Update each section

Most page *introductions* are a short lead on that HTML page. Lists under them are generated from YAML — edit the source project or member, not the listing page.

### Home — `index.html`

| What you see | Where to edit |
| --- | --- |
| Eyebrow, `AAAAA LAB` title, five-A line | `.hero__copy` |
| Overview paragraph (hover / focus / tap) | `.hero__overview p` |
| Latest Publication ticker | Automatic: newest 5 published pages. Cards show **year, title, venue** (no authors). |
| Research Area accordion | Automatic from `_data/research_hierarchy.yml` |
| People sentence | `.people-intro` |
| Five rotating portraits | Automatic: members with `homepage: true` in `_people/`. |

To change ticker copy, edit the published project’s YAML (`title`, `year`, `venue`, `date`). To hide a paper from Home and Publication, set `listed: false`.

### People — `_people/`

Each member is one Markdown file in `_people/`. Front matter is the **name, role, institution, focus, portrait, and links**. The body is a short biography. Home and People both read this collection. The intro page is identity only — portrait, name, facts, links, and bio. It does not list selected work.

| What you see | Where to edit |
| --- | --- |
| Page title and lead | `people/index.html` → `.page-hero` |
| Honeycomb | Every `_people/*.md` with `listed: true` |
| Homepage constellation | Files with `homepage: true` (keep this to five) |
| Lab intro page | `_people/<slug>.md` → `/people/<slug>/` |
| Card destination | Always the Markdown intro |
| Personal website | `website` on that intro page |

```yaml
title: Ye Yuan
role: Ph.D. Candidate
institution: McGill University · Mila
focus: Generative AI · BBO · Agents
website: https://stevenyuan666.github.io/   # linked from the intro page
listed: true
homepage: true
```

- Portraits on Home and People always open `/people/<slug>/`.
- **`website`** is the Personal site link on that page: an external URL, or a path such as `/people/<slug>/site/` for a custom HTML site in `people/<slug>/`. Copy `people/member-template/` and keep that site off `/people/<slug>/`.
- No `website` — the intro page simply has no Personal site link.

To add a member: create `_people/<slug>.md`. Put a portrait in `assets/images/people/` when you have one.

### Research — `research/index.html` and `_research/`

| What you see | Where to edit |
| --- | --- |
| Directory title and lead | `research/index.html` → `.page-hero` |
| Main areas (Algorithm, Agent, Evaluation) and sub-area links | `_data/research_hierarchy.yml` |
| Sub-area introduction | `_research/<slug>.md` |

A sub-area page is Markdown. Front matter is the short intro; the body is the long introduction:

```yaml
title: Social Deduction
nav: research
parent_area: Evaluation
summary: One or two sentences shown under the title.
lead: Member name
keywords:
  - Keyword
```

```markdown
## Research introduction
## Current direction
```

Related projects appear when an on-going or published project uses the same `research_area_slug` as the file name (`social-deduction.md` → `research_area_slug: social-deduction`).

**Add a sub-area**

1. Add it under the right main area in `_data/research_hierarchy.yml`.
2. Copy `_research/area-template.md` to `_research/your-slug.md`.
3. Fill title, parent, summary, lead, keywords, and the two Markdown sections.

### Publication — `publication/index.html`

| What you see | Where to edit |
| --- | --- |
| Directory title and lead | `.page-hero` |
| Paper cards | Automatic from published YAML. Cards show authors (or members) and venue. |

There is no separate publication database. Add or edit `projects/<slug>/index.html` instead.

### Projects — `projects/index.html`

| What you see | Where to edit |
| --- | --- |
| Directory title and lead | `.page-hero` |
| Filters and cards | Automatic from `_projects/` plus published HTML |

Search matches title, summary, area, keywords, members, authors, and venue.

### Shared chrome

| What you see | Where to edit |
| --- | --- |
| Header wordmark | `_includes/site-mark.html`, logo at `assets/images/brand/` |
| GitHub / Hugging Face | `_includes/site-presence.html` |
| Nav labels and order | `_includes/site-nav.html` |
| Footer line | `_includes/site-footer.html` |
| Browser tab icon | `_includes/head-icons.html` and `assets/images/brand/favicon.png` (transparent PNG) |

Site-wide five-A wording also appears in `_config.yml` (`description`) and the footer.

## Add an on-going project

Copy `_projects/ongoing-project-template.md` to `_projects/your-slug.md`. Keep the `Overview`, `Motivation`, and `Goals` headings.

```yaml
title: Project title
status: ongoing
research_area: BBO
research_area_slug: bbo
keywords:
  - Keyword
members:
  - Member name
summary: Short introduction used on cards.
```

The page is generated at `/projects/your-slug/`.

## Add a published project

Create `projects/your-slug/index.html`. `projects/project-template/` is a starting point (`listed: false`, so it stays out of catalogs).

Directories only read the YAML. The HTML body can be anything: custom CSS, Canvas, WebGL, video, or a layout that does not look like the rest of the site.

```yaml
layout: null
nav: projects
status: published
listed: true
date: 2026-05-26
permalink: /projects/your-slug/
title: Paper or project title
year: 2026
summary: Short introduction used on project cards.
research_area: Social Deduction
research_area_slug: social-deduction
authors:
  - First Author
members:
  - Lab member on the card
venue: EMNLP 2026 Main Conference
keywords:
  - Keyword
```

| Field | Used by |
| --- | --- |
| `listed: true` | Home ticker, Publication, Projects catalog, Research related work |
| `date` | Sort order (newest first) |
| `year` | Card year label |
| `venue` | Ticker (venue only) and Publication cards |
| `authors` / `members` | Publication cards and project cards |
| `research_area_slug` | Research area page and Projects area filter |

Set `listed: false` for drafts and templates.

## Local development

Ruby 3.4 and Bundler are required.

```powershell
bundle install
bundle exec jekyll serve --port 4000
```

Open `http://127.0.0.1:4000/`.

On Windows the file watcher often misses CSS and includes. If a change does not appear, rebuild:

```powershell
bundle exec jekyll build
```

Then refresh the browser (hard-refresh if the tab icon looks stale).

Restart `jekyll serve` after editing `_config.yml`. The watcher does not reload collections, so People can render empty until the server is restarted.

## Deployment

Push to `main` to run `.github/workflows/pages.yml`. The workflow builds the Jekyll source and deploys `_site` to GitHub Pages.

Do not commit `_site/`, `.agents/`, or `skills-lock.json`.
