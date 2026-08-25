import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";

/** Sample editorial article used by the "Auto-fill" action, mirroring Add Product. */
export const blogSampleData: BlogFormValues = {
  title: "The Ritual of Slow Beauty",
  subtitle: "Why unhurried skincare routines deliver the most lasting glow.",
  category: "Rituals",
  categoryIds: [],
  tags: "skincare, ritual, mindfulness, glow",
  authorName: "Dr. Elena Vos",
  authorRole: "Lead Cosmetic Chemist",
  authorAvatar: "/avatars/user-03.webp",
  readingTimeMin: 6,
  banner: "/magazine/images/banners/842915.webp",
  thumbnail: "/magazine/images/thumbnails/842915.webp",
  layoutStyle: "editorial",
  contentBlocks: [
    { type: "heading", content: "Begin with intention" },
    {
      type: "paragraph",
      content:
        "Slow beauty is less about products and more about presence. Each step becomes a moment to reconnect with yourself, letting actives absorb fully before the next layer.",
    },
    {
      type: "quote",
      content: "Your skin remembers consistency far more than intensity.",
    },
    {
      type: "paragraph",
      content:
        "Build a routine you can keep: a gentle cleanse, a hydrating essence, a targeted serum, and a barrier-sealing moisturizer. Repeat it nightly and let time do the rest.",
    },
  ],
};
