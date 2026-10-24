# Source photographs

Everything in this folder is **placeholder imagery** — AI-generated stand-ins.
Replace each file with a real photograph of your own, keeping the same file name.

Landscape orientation, at least 1600px wide, JPG.

| File | Used on |
| --- | --- |
| `placeholder-hero-education.jpg` | Homepage hero |
| `placeholder-about-team.jpg` | About — story |
| `placeholder-elearning.jpg` | Education — hero |
| `placeholder-education-materials.jpg` | Education — supplies |
| `placeholder-logistics.jpg` | Logistics — hero |
| `placeholder-procurement.jpg` | Procurement — hero |
| `placeholder-procurement-meeting.jpg` | Procurement — how we work |
| `placeholder-contact.jpg` | Contact — social sharing card only |

After replacing files, regenerate every size and format:

```bash
npm run images && npm run build
```

## Using images in page files

```html
{{img|name=placeholder-hero-education|alt=Describe the photo|sizes=(min-width: 900px) 52vw, 100vw}}
```

Optional arguments:

| Argument | Meaning |
| --- | --- |
| `name` | file name in this folder, without `.jpg` |
| `alt` | **required** — describe the image for screen readers |
| `sizes` | how wide the image renders at each breakpoint (default `100vw`) |
| `ratio` | crop ratio, e.g. `16:9`; defaults to the source image ratio |
| `eager=1` | load immediately and prioritise (use for the hero only) |
| `class` / `id` | optional attributes on the `<picture>` element |

Available widths are generated automatically: 480, 768, 1080, 1440 and 1600px (only
those smaller than the source).

## Originals

If you want to keep full-resolution masters in the repository, put them in a separate
folder (for example `src/images/originals/`) that is **not** published — the build only
publishes `public/`.
