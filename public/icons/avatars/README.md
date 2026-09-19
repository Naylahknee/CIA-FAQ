# Header avatar icons

Food icons rotated per sign-in for the community header (cupcake, croissant,
glass of wine, and so on).

Drop the files here and they are picked up by filename — no code change needed
as long as they are listed in `FOOD_ICONS` in the community header component.

Guidance:
- SVG preferred (crisp at any size, tiny). PNG at 2x also fine.
- Square, roughly 64x64 or larger, with the subject centred and a little padding.
- Transparent background; the header tints the circle behind it.
- Monochrome or flat colour reads best at 40px.
- Lowercase, hyphenated names: `cupcake.svg`, `croissant.svg`, `wine-glass.svg`.

Anything served from `public/` is publicly readable by URL, so decorative icons
only — nothing sensitive.
