# Balloon Friends — Shopify Theme

A clean, conversion-focused Shopify Online Store 2.0 theme for **Balloon Friends** — the walking balloon pet for kids. Design modelled on [nooklights.store](https://nooklights.store/) (Lora + Poppins, white/plum/purple palette) with a tap-to-build bundle buy box inspired by [crochetcoasters.com](https://www.crochetcoasters.com/).

## Highlights

- **Homepage**: hero → bundle buy box → image-with-text → comparison table ("Why Balloon Friends?") → guarantees icon bar → testimonials → FAQ → contact form.
- **3-for-2 bundle builder** (`snippets/bundle-buy-box.liquid` + `assets/theme.js`): tap variant tiles to build a bundle, live "Your bundle · X of 3" slots, savings badge, and one-click add-to-basket of all selected items. Pricing mirrors the store's automatic **Buy 2 get 1 free** discount, which applies at checkout.
- **Product page**: gallery + buy box + description, guarantees, testimonials, FAQ.
- **Cart**: bundle-nudge banner ("Add 1 more to get one FREE"), discount rows, quantity steppers.
- Variant tiles automatically show **variant images** once uploaded (emoji placeholders until then).

## Store configuration (already applied via Shopify Admin API)

- Product `balloon-friend` — *Balloon Friend™ — The Walking Balloon Pet*, £14.99, Style variants: Puppy, Dino, Unicorn, Bunny, Panda, Kitty.
- Automatic discount **“3 FOR 2 — Mix & Match Balloon Friends”** (buy 2, get 1 free on this product).

## Theme settings

Colors, logo, bundle size (buy N / free per bundle), and social links are configurable under **Theme settings** in the Shopify editor. All homepage copy is editable per-section.

## Development

Standard OS 2.0 structure (`layout/`, `sections/`, `snippets/`, `templates/`, `config/`, `assets/`, `locales/`). Use the [Shopify CLI](https://shopify.dev/docs/themes/tools/cli): `shopify theme dev` to preview, `shopify theme push` to deploy.
