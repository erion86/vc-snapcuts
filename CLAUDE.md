# V&C Snapcuts — Online Store
### Production-Ready Product & Design Specification

**Prepared as:** Senior Product Designer + Full-Stack Architecture brief
**Stack:** Next.js (App Router) · React · Tailwind CSS · Firebase (Auth / Firestore / Storage) · Cloudinary · PayMongo
**Status:** Specification only — no implementation code. This document is the source of truth for build.

---

## 0. Design Thesis (read this first)

Most handmade-craft stores collapse into one of two failure modes: too *childish* (rainbow stickers, comic fonts, clutter) or too *cold* (generic minimal template that erases the handmade soul). V&C Snapcuts has to sit precisely between them — **a quiet luxury stationery boutique that happens to be handmade.**

Three principles drive every decision below:

1. **The product is paper, so the interface should feel like paper.** Soft edges, generous whitespace, warm off-whites, and a tactile signature device (see §6 — the *kiss-cut edge*). Nothing should feel like a plastic SaaS dashboard.
2. **Cute lives in the details, not the layout.** The grid stays disciplined and editorial; the warmth comes from micro-touches — a hand-drawn divider, a washi-tape tag on a sale badge, a soft serif headline. This is how we get "cute but not childish."
3. **Mobile is the product, desktop is the bonus.** The target buyer is scrolling on a phone, likely from Instagram. Every flow is designed thumb-first; desktop is an enhancement, never the reference design.

---

## 1. Project Architecture

### 1.1 Rendering strategy (Next.js App Router)
Choosing the right rendering mode per route is the single biggest lever for the "fast loading" requirement.

| Route | Strategy | Why |
|---|---|---|
| Home `/` | **ISR** (revalidate ~60s) | Mostly static, refreshes for new arrivals/best sellers without rebuilds |
| Shop `/shop` | **Server Components + client filters** | SEO-indexable shell, filtering handled client-side over a cached product list |
| Product `/product/[slug]` | **ISR** (revalidate on stock/price change via webhook or tag revalidation) | Fast, cacheable, SEO-critical |
| Category `/category/[slug]` | **ISR** | Same as product |
| Cart `/cart` | **Client (CSR)** | Personal, never cached |
| Checkout `/checkout` | **Server actions + client** | Sensitive, dynamic, talks to PayMongo |
| Account / Orders / Wishlist | **CSR behind auth** | User-private |
| Admin `/admin/*` | **CSR behind role guard** | Private, role-gated |

### 1.2 System layers
```
┌─────────────────────────────────────────────────────────┐
│  CLIENT (Next.js / React / Tailwind)                      │
│  - Server Components for SEO shells                       │
│  - Client Components for cart, filters, interactivity     │
│  - next/image pointed at Cloudinary loader                │
└───────────────┬───────────────────────────┬──────────────┘
                │                           │
        Firebase SDK (web)          Next.js Route Handlers /
                │                   Server Actions (secure)
                │                           │
┌───────────────▼─────────┐   ┌─────────────▼────────────────┐
│  FIREBASE                │   │  THIRD-PARTY (server-side)    │
│  - Auth (email, Google)  │   │  - PayMongo (payments)        │
│  - Firestore (data)      │   │  - Cloudinary (image CDN)     │
│  - Storage (raw uploads) │   │  - Resend/Email (txn emails)  │
│  - Security Rules        │   └───────────────────────────────┘
└──────────────────────────┘
```

### 1.3 Key architectural decisions
- **Cloudinary is the image source of truth for display; Firebase Storage holds the original upload.** Admin uploads → Storage (raw backup) → also pushed to Cloudinary → Firestore stores the Cloudinary `public_id`. The frontend builds responsive URLs from `public_id` via `next/image` with a custom Cloudinary loader. This gives automatic WebP/AVIF, on-the-fly resizing, and tiny payloads (directly serves the "fast loading" goal).
- **All payment + secret operations run server-side** (Next.js Route Handlers / Server Actions). The PayMongo secret key never touches the client. Client only ever receives a checkout session URL or payment intent client key.
- **Cart is hybrid:** guest cart in `localStorage` (+ React context), merged into Firestore on login so it survives across devices.
- **Role-based access** is enforced in two places: Firestore Security Rules (hard boundary) and UI route guards (UX). A custom claim or a `role` field on the user doc gates `/admin`.
- **Orders are immutable financial records.** Once created, an order's line items + prices are frozen (snapshotted), never re-read from the live product. Product price changes must never alter historical orders.

---

## 2. Folder Structure

```
vc-snapcuts/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                  # Home
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   ├── shop/
│   │   ├── page.tsx                  # Shop + filters
│   │   └── loading.tsx
│   ├── category/[slug]/page.tsx
│   ├── product/[slug]/
│   │   ├── page.tsx                  # PDP
│   │   └── opengraph-image.tsx       # dynamic OG image
│   ├── cart/page.tsx
│   ├── checkout/
│   │   ├── page.tsx
│   │   └── success/page.tsx
│   ├── account/
│   │   ├── layout.tsx                # auth guard
│   │   ├── page.tsx                  # profile
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   └── wishlist/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                # role guard
│   │   ├── page.tsx                  # dashboard
│   │   ├── products/...              # list / new / [id]/edit
│   │   ├── inventory/page.tsx
│   │   ├── orders/...
│   │   ├── coupons/...
│   │   └── reviews/page.tsx          # moderation
│   ├── api/
│   │   ├── checkout/route.ts         # create PayMongo session
│   │   ├── webhooks/paymongo/route.ts
│   │   └── revalidate/route.ts
│   ├── layout.tsx                    # root: fonts, theme provider
│   ├── globals.css
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                           # primitives (Button, Input, Badge…)
│   ├── layout/                       # Header, Footer, MobileNav, CartDrawer
│   ├── product/                      # ProductCard, Gallery, VariantPicker…
│   ├── shop/                         # FilterPanel, SortDropdown, SearchBar
│   ├── home/                         # Hero, CategoryGrid, Testimonials…
│   ├── cart/                         # CartLine, CartSummary
│   ├── checkout/                     # Stepper, AddressForm, PaymentMethods
│   ├── account/
│   └── admin/
├── lib/
│   ├── firebase/                     # client.ts, admin.ts, auth.ts
│   ├── cloudinary.ts                 # loader + upload helpers
│   ├── paymongo.ts                   # server-only client
│   ├── db/                           # typed Firestore queries
│   └── validators/                   # zod schemas
├── hooks/                            # useCart, useAuth, useWishlist…
├── context/                          # CartProvider, ThemeProvider, AuthProvider
├── types/                            # shared TS types (Product, Order…)
├── styles/                           # tailwind tokens / theme
├── public/                           # fonts, static svg motifs, icons
├── config/                           # site config, nav, categories
├── tailwind.config.ts
├── next.config.js
└── firestore.rules
```

---

## 3. Database Schema (Firestore)

Firestore is document-based, so the schema is designed for **read efficiency** (denormalize where it speeds the page) while keeping **orders immutable**.

### `products/{productId}`
```
{
  slug: string                 // unique, URL key
  title: string
  description: string          // rich text / markdown
  shortDescription: string
  category: string             // category slug (ref)
  tags: string[]               // "seasonal", "bestseller", "new"
  price: number                // base price in centavos (PHP) — store as int
  compareAtPrice: number|null  // for "sale" strikethrough
  currency: "PHP"
  images: [{ publicId, alt, order }]   // Cloudinary public_ids
  variants: [{
      id, name,                // e.g. "A5 / Sage"
      options: { size, color },
      priceDelta: number,      // added to base
      stock: number,
      sku: string
  }]
  hasVariants: boolean
  stock: number                // for no-variant products
  status: "active"|"draft"|"archived"
  rating: { average: number, count: number }  // denormalized from reviews
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean        // can be auto-set by sales count job
  createdAt, updatedAt: timestamp
  seo: { title, description }
}
```

### `categories/{categoryId}`
```
{ slug, name, description, image (publicId), order, parent: string|null }
```
> Supports: Planners, Stickers, Journals, Scrapbooking, Accessories, Seasonal.

### `users/{uid}`
```
{
  email, displayName, photoURL,
  role: "customer"|"admin",
  phone,
  addresses: [{ id, label, name, line1, line2, city, province, postal, phone, isDefault }],
  createdAt, lastLoginAt
}
```

### `users/{uid}/wishlist/{productId}`
```
{ productId, addedAt }            // subcollection → fast per-user reads
```

### `carts/{uid}`
```
{ items: [{ productId, variantId, qty, priceSnapshot }], updatedAt }
```

### `orders/{orderId}`  *(immutable after creation)*
```
{
  orderNumber: string,            // human-friendly e.g. VCS-000142
  userId: string|null,            // null = guest checkout
  email, phone,
  items: [{
     productId, title, variantName, sku,
     qty, unitPrice, lineTotal,   // FROZEN snapshot
     imagePublicId
  }],
  subtotal, shippingFee, discount, total,    // centavos
  coupon: { code, type, value }|null,
  shippingAddress: {...},
  status: "pending"|"paid"|"processing"|"shipped"|"delivered"|"cancelled"|"refunded",
  payment: {
     provider: "paymongo",
     method: "gcash"|"maya"|"card"|"grab_pay",
     intentId, status, paidAt
  },
  tracking: { courier, number }|null,
  timeline: [{ status, at, note }],
  createdAt, updatedAt
}
```

### `reviews/{reviewId}`
```
{
  productId, userId, userName,
  rating: 1-5, title, body,
  images: [publicId],
  status: "pending"|"approved"|"rejected",   // moderation
  verifiedPurchase: boolean,
  helpfulCount: number,
  createdAt
}
```

### `coupons/{code}`  *(doc id = the code, uppercased)*
```
{
  code, type: "percent"|"fixed"|"free_shipping",
  value: number,
  minSpend: number,
  usageLimit: number, usedCount: number,
  perUserLimit: number,
  startsAt, expiresAt,
  appliesTo: "all"|"category"|"product",
  targetIds: string[],
  active: boolean
}
```

### `newsletter/{email}`
```
{ email, source: "footer"|"popup", subscribedAt, consent: true }
```

### Supporting notes
- **Composite indexes** needed for: shop queries (`category` + `status` + `createdAt`), best sellers (`isBestSeller` + `rating.average`), reviews (`productId` + `status`).
- **Security Rules outline:** anyone reads `products`/`categories`/approved `reviews`; users read/write only their own `carts`, `wishlist`, `orders`(read), `users` doc; `coupons`/`orders`(write)/all admin collections require `role == admin` (server-verified). Writes to `orders` happen server-side only.
- **Inventory integrity:** stock decrements run inside a **Firestore transaction** at payment confirmation (webhook), not at "add to cart," to avoid phantom stockouts.

---

## 4. UI Wireframes (text / ASCII)

> Mobile-first shown; desktop notes in brackets.

### 4.1 Home
```
┌───────────────────────────────┐
│  ☰   v&c snapcuts        ♡  🛍 │  ← sticky header, cart count badge
├───────────────────────────────┤
│                               │
│      [ HERO IMAGE ]           │  full-bleed lifestyle shot
│   "Handmade to be held."      │  Fraunces headline
│   Planners · Stickers · More  │
│      [ Shop the Collection ]  │  primary button
│                               │
├───────────────────────────────┤
│  Shop by Category             │
│  [Planners][Stickers]         │  2-col scroll cards
│  [Journals][Scrapbook]        │  (desktop: 3–6 across)
├───────────────────────────────┤
│  New Arrivals          See all│  horizontal snap-scroll
│  [card][card][card] →         │
├───────────────────────────────┤
│  Featured                     │  editorial 2-up block
│  [ large product feature ]    │
├───────────────────────────────┤
│  Best Sellers          See all│  product grid 2-col
├───────────────────────────────┤
│  "Loved by 2,000+ makers" ★★★★★│  testimonials carousel
│  [ quote card • avatar ]      │
├───────────────────────────────┤
│  @vcsnapcuts on Instagram     │  3x2 image grid → links out
├───────────────────────────────┤
│  Join the list — 10% off      │  newsletter, single field
│  [ email............ ][→]     │
├───────────────────────────────┤
│  FOOTER: shop · help · social │
└───────────────────────────────┘
```

### 4.2 Shop
```
┌───────────────────────────────┐
│  Shop            🔍 search    │
├───────────────────────────────┤
│ [ Filters ⚙ ]   Sort: New ▾  │  ← filter opens drawer on mobile
├───────────────────────────────┤
│  [chip] [chip] [chip]         │  active filters as removable chips
├───────────────────────────────┤
│  [card]  [card]               │
│  [card]  [card]               │  2-col grid (desktop: sidebar + 3–4 col)
│  [card]  [card]               │
├───────────────────────────────┤
│        [ Load more ]          │
└───────────────────────────────┘
Filter drawer: Category · Price range · Color · In stock · Tags
```

### 4.3 Product (PDP)
```
┌───────────────────────────────┐
│  ← back              ♡  🛍     │
├───────────────────────────────┤
│   [ LARGE IMAGE ]   • • • •    │  swipeable gallery + dots
│   [thumb][thumb][thumb]       │  (desktop: vertical thumbs + zoom)
├───────────────────────────────┤
│  Sage A5 Daily Planner        │
│  ★★★★★ (48)                    │
│  ₱650   ₱̶8̶5̶0̶                  │  price + compareAt
├───────────────────────────────┤
│  Size:  [A5] [A6]             │  variant pills
│  Color: [Sage][Cream][Pink]   │
├───────────────────────────────┤
│  Qty: [ − ] 1 [ + ]           │
│  [   Add to Cart   ]          │  sticky on mobile scroll
│  ♡ Save to wishlist           │
├───────────────────────────────┤
│  Description ▾                │  accordion
│  Materials & care ▾           │
│  Shipping ▾                   │
├───────────────────────────────┤
│  Reviews (48)  ★★★★★          │
│  [ write a review ]           │
│  [review card] [review card]  │
├───────────────────────────────┤
│  You may also like            │
│  [card][card][card] →         │
└───────────────────────────────┘
```

### 4.4 Cart (drawer + page)
```
CART DRAWER (slides from right)
┌──────────────────────┐
│  Your bag (3)     ✕  │
│  [img] Planner       │
│        Sage / A5     │
│        ₱650  [−1+] 🗑 │
│  ...                 │
│  Subtotal    ₱1,950  │
│  [ Checkout ]        │
│  [ View full cart ]  │
└──────────────────────┘
Full page adds: coupon field, shipping estimate, order notes.
```

### 4.5 Checkout (3-step)
```
[ 1 Information ] — [ 2 Shipping ] — [ 3 Payment ]   ← stepper

Step 1: email, contact, shipping address (saved addresses if logged in)
Step 2: courier / rate selection, order notes
Step 3: PayMongo methods → [GCash] [Maya] [Card] [GrabPay]
Right rail (desktop) / collapsible top (mobile): live order summary + coupon
→ redirect to PayMongo → return to /checkout/success
```

### 4.6 Account
```
Account ▸ Profile · Orders · Wishlist · Addresses · Sign out
Orders → list (status pill, date, total) → detail (timeline, items, tracking)
```

### 4.7 Admin Dashboard
```
┌─────────────┬───────────────────────────────┐
│  SIDEBAR    │  Today: ₱ sales · # orders     │
│  Dashboard  │  [ revenue chart ]             │
│  Products   │  Low-stock alerts (table)      │
│  Inventory  │  Recent orders (table)         │
│  Orders     │  Pending reviews (count)       │
│  Coupons    │                                │
│  Reviews    │                                │
└─────────────┴───────────────────────────────┘
Products → table (img, title, stock, price, status) → edit form w/ variants + Cloudinary upload
Inventory → editable stock grid, low-stock filter, CSV export
Orders → filter by status, update status (writes timeline), add tracking
Coupons → CRUD, usage stats
Reviews → approve / reject queue
```

---

## 5. Component List

**UI primitives** — Button, IconButton, Input, Textarea, Select, Checkbox, RadioPill, Badge, Tag, Tooltip, Modal, Drawer, Accordion, Tabs, Skeleton, Toast, Rating(stars), Spinner, EmptyState, Pagination, PriceTag, QuantityStepper.

**Layout** — Header, MobileNav (bottom or hamburger), Footer, CartDrawer, SearchOverlay, ThemeToggle, Breadcrumbs, AnnouncementBar, Container/Section.

**Home** — Hero, CategoryGrid, ProductRail (horizontal snap), FeaturedBlock, BestSellerGrid, TestimonialCarousel, InstagramGallery, NewsletterSignup.

**Shop** — FilterPanel, FilterDrawer, ActiveFilterChips, SortDropdown, SearchBar, ProductGrid, LoadMore.

**Product** — ProductCard, ProductGallery, ImageZoom, VariantPicker, AddToCartBar (sticky mobile), WishlistButton, ProductAccordion, RelatedProducts, StockBadge.

**Reviews** — ReviewSummary, ReviewList, ReviewCard, ReviewForm, StarInput, HelpfulButton.

**Cart / Checkout** — CartLineItem, CartSummary, CouponInput, CheckoutStepper, AddressForm, SavedAddressList, ShippingOptions, PaymentMethodSelect, OrderSummaryRail.

**Account** — ProfileForm, OrderList, OrderDetail, OrderTimeline, WishlistGrid, AddressBook.

**Admin** — StatCard, RevenueChart, DataTable, ProductForm, VariantEditor, ImageUploader (Cloudinary), InventoryTable, OrderStatusUpdater, CouponForm, ReviewModerationCard.

---

## 6. Color Palette

Warm, low-contrast, paper-like. **Text is warm charcoal, never pure black; background is warm off-white, never pure white.** This is what reads as "premium" instead of "default."

### Light (default)
| Token | Hex | Use |
|---|---|---|
| `--bg` Cream | `#FAF6EF` | Page background |
| `--surface` White | `#FFFFFF` | Cards, drawers, sheets |
| `--surface-alt` Light Beige | `#F1E9DB` | Subtle sections, hover fills |
| `--border` Beige | `#E7DDCB` | Hairline dividers, card borders |
| `--primary` Soft Pink | `#E3A9AE` | Primary buttons, accents, badges |
| `--primary-strong` | `#CE8F95` | Hover/active pink |
| `--secondary` Sage | `#9CAF8E` | Tags, success, secondary accents |
| `--secondary-strong` | `#7E9472` | Hover sage |
| `--ink` Warm charcoal | `#332E29` | Primary text |
| `--ink-soft` | `#6B635A` | Secondary text, captions |
| `--sale` Terracotta | `#C2735A` | Sale price / strikethrough cue (used sparingly) |

### Dark mode (warm, not cold)
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#1C1A17` | Espresso background (not black) |
| `--surface` | `#26231F` | Cards |
| `--surface-alt` | `#302C27` | Raised |
| `--border` | `#3A352F` | Dividers |
| `--primary` | `#D9A0A5` | Pink, slightly desaturated |
| `--secondary` | `#9AAE8B` | Sage |
| `--ink` | `#F2ECE2` | Text |
| `--ink-soft` | `#B5ABA0` | Secondary text |

**Accessibility:** all body text pairs (ink on cream, ink on white, ink-soft on surface) target **WCAG AA ≥ 4.5:1**. Pink/sage are *accent* colors — never used as text on cream without darkening to `-strong`, and never as the only signal (always pair color with icon/label).

---

## 7. Typography

The personality lives here. Avoiding the generic Playfair-on-cream cliché.

- **Display — `Fraunces`** (variable, soft serif). Warm, slightly old-style, with optical sizing that turns "luxurious" on at large sizes and stays "cute, not childish" because of its soft terminals. Used for headlines, hero, product titles. Use weights 400–600, generous tracking on large sizes, never ALL CAPS for long strings.
- **Body / UI — `Plus Jakarta Sans`** (or alt: `Hanken Grotesk`). Modern humanist sans, highly legible at small sizes, a touch of warmth. Handles all paragraphs, labels, buttons, prices.
- **Optional wordmark — a single hand-script (e.g. a licensed signature face) for the logo ONLY.** Never in body. This is the one place the "handmade" hand shows up explicitly.

### Type scale (mobile → desktop)
| Role | Family | Size | Weight |
|---|---|---|---|
| Display / Hero | Fraunces | 36 → 64px | 500 |
| H1 page title | Fraunces | 28 → 40px | 500 |
| H2 section | Fraunces | 22 → 30px | 500 |
| H3 | Plus Jakarta | 18 → 20px | 600 |
| Body | Plus Jakarta | 15 → 16px | 400 |
| Small / caption | Plus Jakarta | 13px | 400–500 |
| Price | Plus Jakarta | 16–18px | 600, tabular-nums |
| Button / label | Plus Jakarta | 14px | 600, slight tracking |

Line-height: 1.6 body, 1.15 display. Load via `next/font` (self-hosted, zero layout shift) — directly serves the speed + SEO goals.

### Signature device
**The kiss-cut edge.** Real die-cut stickers have a thin offset outline. We reuse that as the brand's structural motif: featured cards, sale badges, and category tiles get a subtle 2px offset "cut line" border with rounded corners — like a sticker peeled onto the page. Optional faint paper grain on hero/section backgrounds. This is the one memorable element; everything else stays quiet.

---

## 8. Animations

Restrained and tactile. Everything respects `prefers-reduced-motion` (motion reduces to instant opacity changes).

- **Page load:** hero content fades + rises 12px, staggered 60ms between elements. Once, not on every navigation.
- **Scroll reveal:** sections fade-in-up as they enter viewport (Intersection Observer), small distance, ease-out. Used sparingly — not every element.
- **Product cards:** image scales 1.03 + soft shadow lift on hover; wishlist heart does a quick "pop" + fill on tap.
- **Add to cart:** button morphs to a checkmark, cart badge bumps (spring), cart drawer slides in from right. A tiny "flying" thumbnail to the cart icon is optional delight.
- **Gallery:** swipe with snap on mobile; crossfade + zoom on desktop hover.
- **Filters / drawers:** slide + backdrop fade, 200–250ms ease.
- **Skeletons** instead of spinners for grids/PDP to keep perceived speed high.
- **Micro-touches:** the kiss-cut sale badge has a barely-there 2° tilt, like a sticker placed by hand.

**Rules:** durations 150–300ms, easing `cubic-bezier(.2,.8,.2,1)`, no parallax, no autoplay video with sound, nothing that blocks interaction. Motion should feel like *paper settling*, not a web app showing off.

---

## 9. User Flows

**First-time buyer (the core flow)**
```
Instagram link → Home → Category/Shop → PDP → pick variant → Add to Cart
→ Cart drawer → Checkout → guest info → shipping → PayMongo (GCash)
→ Success page → confirmation email → (prompt to create account to track order)
```

**Returning customer**
```
Sign in → saved addresses + wishlist restored → Shop → 1-tap reorder from Order History → Checkout (prefilled) → Pay
```

**Wishlist → purchase**
```
Browse → ♡ save → later: Account ▸ Wishlist → Add to Cart → Checkout
```

**Review flow**
```
Order marked delivered → email asks for review → PDP "Write a review"
→ submit (status: pending) → admin approves → appears publicly (verifiedPurchase ✓)
```

**Coupon flow**
```
Newsletter signup → 10% code emailed → Cart/Checkout coupon field → validate
(min spend, expiry, usage limit) → discount applied → usedCount++ on order paid
```

**Admin fulfillment**
```
Webhook marks order "paid" → stock decremented (transaction) → admin sees it in Orders
→ status → "processing" → add tracking → "shipped" → customer emailed + timeline updated
```

**Auth**
```
Email/password or Google → on first login create users/{uid} (role: customer)
→ guest cart merges into Firestore cart
```

---

## 10. Development Roadmap

Phased so there's a **shippable store as early as possible**, then layers of polish. Estimates assume one developer (you) working iteratively.

### Phase 0 — Foundation (Week 1)
Repo, Next.js App Router, Tailwind + design tokens (§6/§7), `next/font`, theme provider (light/dark), Firebase project, Cloudinary account + loader, base layout (Header/Footer/MobileNav), UI primitives. **Exit:** styled empty shell deploys.

### Phase 1 — Catalog (Weeks 2–3)
Firestore products/categories schema + seed data, admin product CRUD with Cloudinary upload, Home page (hero, categories, rails), Shop (grid, filters, sort, search), PDP (gallery, variants, accordions). **Exit:** customers can browse the full catalog. *(This is also where your existing V&C Snapcuts planner becomes a real product page.)*

### Phase 2 — Cart & Checkout (Weeks 4–5)
Cart context + drawer + page, guest cart persistence, coupon validation, address forms, checkout stepper, **PayMongo integration** (server-side session + webhook), stock transaction on payment, success page, transactional email. **Exit:** a real order can be placed and paid. **← MVP / soft launch.**

### Phase 3 — Accounts & Engagement (Week 6)
Firebase Auth (email + Google), account area (profile, addresses), order history + detail + timeline, wishlist, cart merge on login, reviews (submit + display + moderation), newsletter capture. **Exit:** logged-in experience complete.

### Phase 4 — Admin Operations (Week 7)
Admin dashboard (stats, revenue chart, low-stock alerts), inventory management + CSV export, order management (status + tracking), coupon manager, review moderation queue, role guards + Security Rules hardening. **Exit:** the store runs without touching the database directly.

### Phase 5 — Polish & Launch (Week 8)
SEO (metadata, dynamic OG images, sitemap, robots, structured data/JSON-LD for products), accessibility audit (keyboard, focus, contrast, screen-reader labels), performance pass (Lighthouse, image budgets, code-split), animations (§8), Instagram gallery, error/empty states, analytics. **Exit:** production launch.

### Post-launch backlog
Abandoned-cart email, gift cards, bundles/sets, multi-image reviews, blog/journal content for SEO, seasonal collection landing pages, related-by-purchase recommendations, PWA/installable, iOS-friendly (already mobile-first).

---

## Non-Functional Requirements (baked into every phase)

- **SEO:** server-rendered product/category pages, per-page metadata, JSON-LD `Product`/`Offer`/`AggregateRating`, dynamic OG images, sitemap, clean slugs.
- **Accessibility:** semantic HTML, visible focus rings, AA contrast, labelled controls, keyboard-operable drawers/modals, alt text on all Cloudinary images, reduced-motion support.
- **Performance:** Cloudinary AVIF/WebP + responsive sizes, `next/image`, ISR caching, route-level code splitting, self-hosted fonts, skeletons. Target Lighthouse mobile ≥ 90.
- **Security:** secrets server-side only, Firestore Rules as the hard boundary, webhook signature verification (PayMongo), input validation (zod) on every server action.
- **Money:** all amounts stored as integer centavos; orders snapshot prices; stock changes only in transactions.

---

*End of specification. Recommended next step: lock the two typefaces (Fraunces + Plus Jakarta Sans) and the §6 token table, then start Phase 0. When you're ready to build, we can begin with the design tokens + layout shell and you'll get full files per your usual workflow.*
