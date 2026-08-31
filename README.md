# AAAAA Lab website

GitHub Pages website for AAAAA Lab.

## Content model

- Main site, member pages, and Publication project pages are independent HTML files.
- Main Research Areas and their sub-area links are defined in `_data/research_hierarchy.yml`.
- Research sub-areas are Markdown files in `_research/` and share `_layouts/research-area.html`.
- On-going research projects are Markdown files in `_projects/` and share `_layouts/ongoing-project.html`.
- Published project cards link directly to the matching independent HTML page under `publication/`.

The hierarchy is:

```text
Main area → Sub-area Markdown page → Related projects
```

Home shows five core members. `people/index.html` is the larger directory and currently reserves ten independent member folders.

## Add a Research Area

1. Add the main area and sub-area slug to `_data/research_hierarchy.yml`.
2. Copy `_research/area-template.md` to `_research/your-sub-area-slug.md`.
3. Replace the title, parent area, summary, lead, keywords, introduction, and current direction.
4. Add project entries under `projects`.

Each project card accepts:

```yaml
- title: Project title
  slug: project-folder-name
  status: ongoing # or published
  keywords:
    - Keyword one
    - Keyword two
  summary: Short project introduction.
  members:
    - Member name
```

Routing is automatic:

- `status: ongoing` links to `/projects/<slug>/`.
- `status: published` links to `/publication/<slug>/`.

## Add an on-going project

Copy `_projects/ongoing-project-template.md` to `_projects/your-project-slug.md`. Keep the standard `Overview`, `Motivation`, and `Goals` headings so all active projects have a consistent structure.

## Add a published project

Create `publication/your-project-slug/index.html`. The folder name must match the `slug` used by its Research Area project card. Publication pages may load their own CSS, JavaScript, Canvas, WebGL, video, or other interactive assets.

## Local development

Ruby 3.4 and Bundler are required.

```powershell
bundle install
bundle exec jekyll serve --livereload
```

Open `http://127.0.0.1:4000/`.

## Deployment

Pushing to `main` runs `.github/workflows/pages.yml`. The workflow builds the Jekyll source and deploys `_site` to GitHub Pages.
Website for AAAAA
