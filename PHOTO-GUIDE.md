# Adding photographs

1. Put your image in `assets/`.
2. Add an entry to `photos.json`. Separate entries with commas; do not put a comma after the last entry.
3. Save and refresh your local preview. The gallery, filters, counts, and full-screen viewer update together.

```json
{
  "src": "assets/new-photo.jpg",
  "title": "Morning Light",
  "description": "Early morning in the mountains.",
  "categories": ["landscapes", "nature"],
  "alt": "Sunlight reaching a mountain ridge"
}
```

Reorder entries to reorder the gallery. Categories are created automatically. Add as many labels as needed in the `categories` array, for example `"categories": ["wildlife", "macros"]`. A photograph appears under each matching filter, and all its categories appear in its caption. The All images count counts each photo only once. Single categories use the same format: `"categories": ["landscapes"]`. Older `"category": "landscapes"` entries still work. Use consistent lowercase category names such as `landscapes`, `wildlife`, or `macros`. The default credit is Federico Scaramuzza; an optional `credit` overrides it and an optional `url` links to a source. Image filenames are case-sensitive on hosting.

Preview with VS Code's Integrated Browser or run `python3 -m http.server 8000` from the website folder and open http://localhost:8000. Opening index.html directly as a file does not allow the browser to fetch the JSON list.

GitHub Pages remains disabled. Save or push your edits to GitHub to back them up without making the website public.

The list includes all 15 gallery JPEG/PNG images currently in assets. Descriptions for Fuji and Lunch Time were preserved; other new photographs have editable starter titles and alt text, with descriptions left blank. The research figure cwo_cover.png and the camera RAW file DSC_0943.NEF are not gallery entries. Export RAW files as JPEG before adding them.
