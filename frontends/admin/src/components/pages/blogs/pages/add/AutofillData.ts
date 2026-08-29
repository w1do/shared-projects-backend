import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";

/** Sample editorial article used by the "Auto-fill" action, mirroring Add Product. */
export const blogSampleData: BlogFormValues = {
  title: "The Ritual of Slow Beauty",
  subtitle: "Why unhurried skincare routines deliver the most lasting glow.",
  category: "Rituals",
  categoryIds: [],
  tags: "skincare, ritual, mindfulness, glow",
  readingTimeMin: 6,
  banner: "/magazine/images/banners/842915.webp",
  thumbnail: "/magazine/images/thumbnails/842915.webp",
  layoutStyle: "editorial",
  contentBlocks: [
    {
      title: "Begin with intention",
      markdown:
        "Slow beauty is less about products and more about presence. Each step becomes a moment to reconnect with yourself, letting actives absorb fully before the next layer.",
    },
    {
      title: "Consistency over intensity",
      markdown: "> Your skin remembers consistency far more than intensity.",
    },
    {
      title: "Build a routine you can keep",
      markdown:
        "A gentle cleanse, a hydrating essence, a targeted serum, and a barrier-sealing moisturizer. Repeat it nightly and let time do the rest.",
    },
  ],
};
