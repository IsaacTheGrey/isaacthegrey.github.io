# Federico Scaramuzza — Research & Photography

Private working copy of a personal research and photography website. GitHub Pages is not enabled.

## Editing the site

- `index.html`: biography, CV, publications, contact information, and the gallery container.
- `styles.css`: visual design and mobile layouts.
- `app.js`: gallery viewer, filters, and navigation.
- `photos.json`: the single photo list; edit this to add or change gallery photographs.
- `assets/`: images, favicon, and the original CV PDF.

To add a photograph, put the image in `assets/` and add one entry to `photos.json`. The gallery, category filters, counts, captions, and full-screen viewer update automatically. See `PHOTO-GUIDE.md` for examples.

## Preview locally

From this folder, run `python3 -m http.server 8000`, then open `http://localhost:8000`. Stop with Ctrl+C.

## Publication

Publish from the `main` branch and repository root. The `.nojekyll` file lets GitHub serve the site directly without a site generator.