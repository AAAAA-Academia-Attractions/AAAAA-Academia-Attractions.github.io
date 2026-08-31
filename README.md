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

Everyone has a **lab intro** at `/people/<slug>/`, generated from `_people/<slug>.md`. Home and People portraits always open that page. A personal homepage — GitHub Pages or a folder on this site — is only a **Personal site** link on the intro. Do not list papers on the intro; keep it to portrait, facts, links, and a short bio.

| What you see | Where to edit |
| --- | --- |
| People page title and lead | `people/index.html` |
| Honeycomb | Every `_people/*.md` with `listed: true` |
| Home constellation (five portraits) | Files with `homepage: true` |
| Lab intro | `_people/<slug>.md` |

**Every member starts the same way.** Create `_people/<slug>.md` (for example `_people/ye-yuan.md`). Put a photo at `assets/images/people/<slug>.jpg` when you have one. Then choose A or B below for the personal site.

| Field | Required | What it does |
| --- | --- | --- |
| `title` | yes | Name on cards and the intro |
| `role` | yes | Role line (Ph.D. Candidate, …) |
| `institution` | yes | School / lab line |
| `focus` | yes | Short research focus on the card |
| `listed` | yes | `true` to show in the People honeycomb |
| `homepage` | no | `true` to also show on Home (keep five) |
| `portrait` | no | Path such as `/assets/images/people/ye-yuan.jpg` |
| `email` | no | Mailto link on the intro |
| `website` | no | Personal site — see A and B |
| `scholar` / `github` / `cv` | no | Extra links on the intro |
| Markdown body | no | Short biography under the facts |

#### A. They already have a GitHub (or other) homepage

Do **not** create a folder under `people/`. Only the Markdown file. Set `website` to the live URL.

```yaml
title: Ye Yuan
role: Ph.D. Candidate
institution: McGill University · Mila
focus: Generative AI · BBO · Agents
email: ye.yuan3@mail.mcgill.ca
portrait: /assets/images/people/ye-yuan.jpg
website: https://stevenyuan666.github.io/
scholar: https://scholar.google.com/citations?user=lemEc74AAAAJ
github: https://github.com/StevenYuan666
cv: https://stevenyuan666.github.io/assets/pdf/CV_Ye_YUAN_2026.pdf
listed: true
homepage: true
```

```text
Click portrait  →  /people/ye-yuan/                 (this lab’s intro)
Personal site   →  https://stevenyuan666.github.io/ (their GitHub Pages)
```

Add `scholar`, `github`, or `cv` the same way if they have them. Omit any they do not have.

#### B. They will design a homepage in this repo

Still create `_people/<slug>.md`. Then add a **separate** HTML site under `people/<slug>/site/` so it does not collide with the intro at `/people/<slug>/`.

1. Copy `people/member-template/` to `people/<slug>/site/`.
2. In that folder’s `index.html`, set:

```yaml
layout: null
nav: people
permalink: /people/<slug>/site/
```

3. Design the page freely (own CSS, JS, layout). Shared lab chrome is optional.
4. In `_people/<slug>.md`, set `website` to that **path**, not an `https://` URL:

```yaml
title: Example Name
role: Ph.D. Student
institution: McGill University · Mila
focus: Agents
portrait: /assets/images/people/example-name.jpg
website: /people/example-name/site/
listed: true
homepage: false
```

```text
Click portrait  →  /people/example-name/      (lab intro)
Personal site   →  /people/example-name/site/ (their HTML in this repo)
```

Do not use `permalink: /people/<slug>/` on the custom HTML. That address is reserved for the Markdown intro.

#### C. No personal homepage yet

Omit `website`. Portraits still open the lab intro; that page has no Personal site link. Add `website` later using A or B.

To add a member: `_people/<slug>.md` + optional portrait + A, B, or C.

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
