# V&C Snapcuts — Online Store

Premium handmade crafts e-commerce built with Next.js 14, Tailwind CSS, Firebase, Cloudinary & PayMongo.

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- npm or yarn

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.local.example .env.local
# Fill in your Firebase, Cloudinary, and PayMongo keys
```

### 4. Run the dev server
```bash
npm run dev
# Open http://localhost:3000
```

---

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Foundation: tokens, fonts, layout shell | ✅ Done |
| 1 | Catalog: products, shop, PDP | Done |
| 2 | Cart, checkout, PayMongo | Done |
| 3 | Accounts, wishlist, reviews | Done |
| 4 | Admin dashboard | Done |
| 5 | Polish, SEO, launch | Done |

---

## Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + CSS Variables
- **Fonts:** Fraunces (display) + Plus Jakarta Sans (body) via next/font
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Storage:** Firebase Storage (originals) + Cloudinary (display CDN)
- **Payments:** PayMongo (GCash, Maya, Card, GrabPay)
- **Icons:** Lucide React

---

## Project Structure
See the full spec in `VC-Snapcuts-Store-Spec.md` for folder structure, DB schema, component list, and roadmap.
