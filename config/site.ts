export const siteConfig = {
  name:        "V&C Snapcuts",
  tagline:     "Handmade to be held.",
  description: "Handmade planners, stickers, journals & scrapbooking supplies crafted with love in the Philippines.",
  url:         process.env.NEXT_PUBLIC_SITE_URL || "https://vcsnapcuts.com",
  ogImage:     "/og-default.jpg",

  // Social
  social: {
    instagram: "https://instagram.com/vcsnapcuts",
    facebook:  "https://facebook.com/vcsnapcuts",
    tiktok:    "https://tiktok.com/@vcsnapcuts",
    shopee:    "https://shopee.ph/vcsnapcuts",
  },

  // Contact
  contact: {
    email:    "hello@vcsnapcuts.com",
    location: "Philippines",
  },
};

// ── Navigation ────────────────────────────────────────────────────────
export const navLinks = [
  { label: "Shop",         href: "/shop" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Best Sellers", href: "/shop?filter=bestseller" },
  { label: "About",        href: "/about" },
];

// ── Product categories ────────────────────────────────────────────────
export const categories = [
  {
    slug:        "planners",
    name:        "Planners",
    description: "Undated and dated planners designed for real life.",
    emoji:       "📓",
    color:       "bg-primary/20",
  },
  {
    slug:        "stickers",
    name:        "Stickers",
    description: "Kiss-cut and die-cut sticker sheets for every vibe.",
    emoji:       "✨",
    color:       "bg-secondary/20",
  },
  {
    slug:        "journals",
    name:        "Journals",
    description: "Blank, dotted, and lined journals for every writer.",
    emoji:       "📔",
    color:       "bg-surface-alt",
  },
  {
    slug:        "scrapbooking",
    name:        "Scrapbooking",
    description: "Papers, ephemera, and supplies for memory keeping.",
    emoji:       "🎨",
    color:       "bg-primary/10",
  },
  {
    slug:        "accessories",
    name:        "Accessories",
    description: "Washi tape, clips, pens & more for your desk.",
    emoji:       "🖊️",
    color:       "bg-secondary/10",
  },
  {
    slug:        "seasonal",
    name:        "Seasonal",
    description: "Limited collections for holidays & special seasons.",
    emoji:       "🌸",
    color:       "bg-sale/10",
  },
];

// ── Footer links ──────────────────────────────────────────────────────
export const footerLinks = [
  {
    heading: "Shop",
    links: [
      { label: "All Products",   href: "/shop" },
      { label: "New Arrivals",   href: "/shop?filter=new" },
      { label: "Best Sellers",   href: "/shop?filter=bestseller" },
      { label: "Gift Ideas",     href: "/shop?tag=gift" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "FAQs",           href: "/faq" },
      { label: "Shipping Info",  href: "/shipping" },
      { label: "Returns",        href: "/returns" },
      { label: "Contact Us",     href: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About",          href: "/about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms",          href: "/terms" },
    ],
  },
];
