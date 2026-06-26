import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";

const posts = [
  {
    src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80",
    alt: "Planner flat lay",
  },
  {
    src: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
    alt: "Sticker sheet",
  },
  {
    src: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
    alt: "Journal spread",
  },
  {
    src: "https://images.unsplash.com/photo-1586075010923-2dd457fb0b5c?w=400&q=80",
    alt: "Washi tape desk",
  },
  {
    src: "https://images.unsplash.com/photo-1456324504439-367cee3b3a32?w=400&q=80",
    alt: "Seasonal planner",
  },
  {
    src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&q=80",
    alt: "Scrapbook papers",
  },
];

export function InstagramGallery() {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {posts.map((post, i) => (
          <a
            key={i}
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-xl overflow-hidden bg-surface-alt group border border-border hover:border-primary/30 transition-colors"
          >
            <Image
              src={post.src}
              alt={post.alt}
              fill
              sizes="(max-width: 768px) 33vw, 200px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors flex items-center justify-center">
              <Instagram className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button variant="outline" size="sm" asChild>
          <Link href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer">
            @vcsnapcuts on Instagram
          </Link>
        </Button>
      </div>
    </div>
  );
}
