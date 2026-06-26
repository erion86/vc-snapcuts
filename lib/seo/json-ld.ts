import type { Product } from "@/types/product";
import { siteConfig } from "@/config/site";

export function productJsonLd(product: Product, url: string) {
  const image = product.images[0]?.publicId ?? siteConfig.ogImage;

  return {
    "@context": "https://schema.org",
    "@type":    "Product",
    name:       product.title,
    description: product.shortDescription,
    image,
    sku:        product.hasVariants ? product.variants[0]?.sku : product.id,
    brand: {
      "@type": "Brand",
      name:    siteConfig.name,
    },
    offers: {
      "@type":         "Offer",
      url,
      priceCurrency:   product.currency,
      price:           (product.price / 100).toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(product.rating.count > 0 && {
      aggregateRating: {
        "@type":       "AggregateRating",
        ratingValue:   product.rating.average,
        reviewCount:   product.rating.count,
      },
    }),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type":    "Organization",
    name:       siteConfig.name,
    url:        siteConfig.url,
    description: siteConfig.description,
    sameAs: [
      siteConfig.social.instagram,
      siteConfig.social.facebook,
      siteConfig.social.tiktok,
    ],
  };
}
