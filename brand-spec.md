# AAAAA Community brand specification

This file documents the shared visual system used by the public HTML pages. It is project documentation, not a website content page.

## Identity

- Wordmark: `AAAAA Community`, paired with the circular emblem in `assets/images/brand/aaaaa-community.png`.
- Full line: `Advanced · Analytical · Adaptive · Adventurous · Aspiring`.
- Tone: academic, editorial, precise, and quietly experimental.

## Palette

- Paper: `#F2F0E9`
- Ink: `#171C1A`
- Pine: `#183F3A`
- Brass: `#A27D52`
- Sage: `#C8D0CB`
- Mist: `#E5E4DE`

## Typography

- Interface and body: Manrope, weights 400 and 500.
- Display and long-form editorial text: Newsreader, optical size axis enabled.

## Asset status

- Official logo: `assets/images/brand/aaaaa-community.png`, with favicon variants in `assets/images/brand/favicon.png`, `assets/apple-touch-icon.png`, and `favicon.ico`.
- Ye Yuan portrait: `assets/images/people/ye-yuan.jpg`, sourced from his official personal website (`https://stevenyuan666.github.io/assets/img/profile_photo.jpg`).
- Remaining member portraits: pending. Their cards use explicit portrait placeholders until real images are added.
- Publication/project media: pending. Project pages include honest demo and media slots.

## Page rules

- Shared navigation order: Home, People, Publication. The Projects catalog is hidden for now; individual published pages still live under `projects/<slug>/`.
- Main site pages use shared files under `assets/`.
- Every member page gets its own folder and `index.html`.
- Homepage research themes are listed in `_data/research_themes.yml` and are not separate pages.
- On-going projects use the shared Markdown template in `_projects/` and are listed under Projects.
- Published projects are independent HTML pages in `projects/<slug>/` and may use any layout, CSS, or interaction. Only their YAML front matter is read by the Projects / Publication directories.
- Individual pages may add local CSS and JavaScript after the shared stylesheet without changing the main site.
