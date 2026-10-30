# Ticktix Theme

A modern, professional desk theme for Frappe / ERPNext (v15). It restyles the desk and the portal pages without modifying any core Frappe, ERPNext or HRMS file — it is delivered entirely as CSS and JavaScript from this app.

## What it changes

| Area | Change |
| --- | --- |
| Workspace sidebar | Docked full-height left sidebar, toggles between full width and an icon-only rail with hover tooltips; remembers the choice per browser |
| Layout | Full-width pages, consistent side spacing, header and content on one flat surface |
| Mobile | Opaque slide-out drawer, expanding a menu keeps the drawer open, compact navbar |
| Navbar | Uniform 36px controls, compact search with shortcut badge, plain breadcrumbs with `/` separator |
| Menus | Restyled Help and profile dropdowns, profile header with name and email, an icon per menu item |
| Workspace cards | Shortcut cards with accent bar and subtitle, report cards with tinted headers and avatar letters |
| Lists and forms | Restyled filter sidebar, bordered inputs with focus ring, form sidebar that shrinks to an icon rail |
| Portal pages | Restyled My Account page, portal sidebar and footer, with a "Back to Desk" bar |
| Dark mode | Works with Frappe's dark theme (the theme's colours adapt) |

## Requirements

- Frappe / ERPNext **v15**
- A bench with `node` and `yarn` available (needed for `bench build`)

## Installation

```bash
# from the bench directory
bench get-app <repo-url> ticktix_theme
bench --site <your-site> install-app ticktix_theme
bench build --app ticktix_theme
bench --site <your-site> clear-cache
```

Then hard refresh the browser (Cmd/Ctrl + Shift + R).

The app has no doctypes, patches or migrations, so no `bench migrate` is required to use it.

## Updating

```bash
cd apps/ticktix_theme && git pull
cd ../..
bench build --app ticktix_theme
bench --site <your-site> clear-cache
```

Each build produces new hashed file names, so browsers pick up the new CSS and JS automatically.

## Uninstalling

```bash
bench --site <your-site> uninstall-app ticktix_theme
bench build
bench --site <your-site> clear-cache
```

## Project layout

```
ticktix_theme/
├── pyproject.toml
├── README.md
└── ticktix_theme/
    ├── hooks.py                       # registers the bundles below
    └── public/
        ├── css/
        │   ├── ticktix_theme.bundle.css   # desk theme
        │   └── ticktix_web.bundle.css     # website / portal pages
        └── js/
            ├── ticktix_theme.bundle.js    # desk behaviour
            └── ticktix_web.bundle.js      # portal "Back to Desk" bar
```

| Hook | Bundle |
| --- | --- |
| `app_include_css` / `app_include_js` | Desk (`/app`) |
| `web_include_css` / `web_include_js` | Website and portal pages (e.g. `/me`) |

## Customising

All colours and sizes are CSS variables at the top of `ticktix_theme.bundle.css`:

```css
:root {
  --tt-primary: #4f46e5;       /* accent colour */
  --tt-primary-hover: #4338ca;
  --tt-primary-soft: #eef2ff;  /* selected / hover background */
  --tt-sidebar-w: 240px;       /* expanded sidebar width */
  --tt-sidebar-mini-w: 64px;   /* icon-only rail width */
}
```

Other common changes:

| To change | Where |
| --- | --- |
| Colour of report-card and shortcut avatars | `--tt-tone-0` … `--tt-tone-4` variables in `ticktix_theme.bundle.css` |
| Sub-title shown under each shortcut card | `SHORTCUT_SUBTITLES` in `ticktix_theme.bundle.js` |
| Icon for a profile / Help menu item | `RULES` (label to icon) and `I` (the SVGs) in `ticktix_theme.bundle.js` |
| Portal page colours | `:root` variables in `ticktix_web.bundle.css` |

Workspace sidebar icons are not part of this theme: they come from each Workspace's **Icon** field in Frappe.

## Development

1. Edit files under `ticktix_theme/public/`.
2. Run `bench build --app ticktix_theme` (or keep `bench start` running, which usually rebuilds on save).
3. Hard refresh. If a change does not appear, check the file name hash in `sites/assets/assets.json` — if it did not change, the build did not run.

Keep the theme free of company-specific text, URLs and logos. Branding (logo, favicon, application name) belongs in Website Settings, Navbar Settings or your branding app, not in this repository.

## Browser support

Current Chrome, Edge, Safari and Firefox. The sidebar layout uses the CSS `:has()` selector, which needs Chrome/Edge 105+, Safari 15.4+, or Firefox 121+.

## Notes

- Nothing in `frappe`, `erpnext` or `hrms` is patched. Uninstalling the app restores the stock look.
- Only styling and client-side behaviour are changed; permissions, data and workflows are untouched.

## License

MIT
