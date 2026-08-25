import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

export const defaultFormValues: ProductFormValues = {
  name: "",
  shortDescription: "",
  description: "",
  brand: "",
  category: "",
  status: "Draft",
  price: undefined as unknown as number,
  compareAtPrice: undefined,
  costPrice: undefined,
  discount: undefined,
  sku: "",
  trackQuantity: true,
  stock: undefined,
  weight: undefined,
  images: [],
  thumbnail: "",
  collections: [],
  contentBlocks: [],
  variantRelation: {
    mode: "none",
    existingGroupId: "",
    mappedOptions: {},
    newGroupName: "",
    dimensions: [],
    leaderOptions: {},
  },
};

export const sampleProductData: ProductFormValues = {
  name: "Luminous Hydra-Glow Serum",
  shortDescription: "A lightweight, fast-absorbing serum for dewy radiance",
  description:
    "An ultra-luxe hydrating serum infused with bio-fermented hyaluronic acid and snow mushroom extract. Designed for the modern beauty ritual — delivers deep, lasting hydration with a luminous, glass-skin finish. Dermatologist-tested, vegan, cruelty-free.",
  brand: "Ætheria Botanicals",
  category: "Skincare",
  status: "Draft",
  price: 68,
  compareAtPrice: 85,
  costPrice: 22,
  discount: 10,
  sku: "ATH-HYDR-SRM-001",
  trackQuantity: true,
  stock: 150,
  weight: 45,
  images: [
    "/images/products/serum-hero.jpg",
    "/images/products/serum-texture.jpg",
    "/images/products/serum-ingredients.jpg",
  ],
  thumbnail: "/images/products/serum-thumb.jpg",
  collections: ["Hydration Essentials", "Organic Anti-Aging"],
  contentBlocks: [
    {
      id: "block-1",
      title: "Key Ingredients",
      slug: "key-ingredients",
      displayType: "cards",
      content: {
        items: [
          {
            title: "Bio-Fermented Hyaluronic Acid",
            description: "Penetrates 3x deeper than standard HA for lasting hydration",
            image_url: "",
          },
          {
            title: "Snow Mushroom Extract",
            description: "Natural moisture-locking polysaccharide with antioxidant benefits",
            image_url: "",
          },
          {
            title: "Niacinamide 5%",
            description: "Brightens, controls sebum, and strengthens skin barrier",
            image_url: "",
          },
        ],
      },
      isVisible: true,
      position: 0,
    },
    {
      id: "block-2",
      title: "How to Use",
      slug: "how-to-use",
      displayType: "text",
      content: {
        body: "Apply 2-3 drops onto cleansed skin morning and evening. Gently press into face and neck with fingertips. Follow with moisturizer. For best results, use after toner and before heavier creams or oils.",
      },
      isVisible: true,
      position: 1,
    },
    {
      id: "block-3",
      title: "Full Ingredients (INCI)",
      slug: "full-ingredients",
      displayType: "list",
      content: {
        items: [
          "Aqua (Water)",
          "Glycerin",
          "Sodium Hyaluronate (Bio-Fermented)",
          "Tremella Fuciformis (Snow Mushroom) Extract",
          "Niacinamide",
          "Panthenol",
          "Allantoin",
          "Centella Asiatica Extract",
          "Tocopheryl Acetate",
        ],
      },
      isVisible: true,
      position: 2,
    },
    {
      id: "block-4",
      title: "FAQ",
      slug: "faq",
      displayType: "faq_accordion",
      content: {
        items: [
          {
            question: "Is this suitable for sensitive skin?",
            answer:
              "Yes. Our formula is dermatologist-tested, fragrance-free, and free of common irritants. Patch test recommended for extremely reactive skin.",
          },
          {
            question: "Can I use this with retinol?",
            answer:
              "Absolutely. Apply this serum first, wait 1-2 minutes, then follow with your retinol product. The hydrating base helps buffer potential irritation.",
          },
          {
            question: "How long until I see results?",
            answer:
              "Most users report visibly plumper, more radiant skin within 7 days. Full barrier-strengthening benefits develop over 4-6 weeks of consistent use.",
          },
        ],
      },
      isVisible: true,
      position: 3,
    },
    {
      id: "block-5",
      title: "Product Specifications",
      slug: "product-specifications",
      displayType: "key_value",
      content: {
        items: [
          { key: "Volume", value: "30ml / 1.0 fl oz" },
          { key: "Origin", value: "South Korea" },
          { key: "Shelf Life", value: "36 months unopened" },
          { key: "PAO", value: "12 months after opening" },
          { key: "Certification", value: "Vegan, Cruelty-Free, Clean Beauty" },
        ],
      },
      isVisible: true,
      position: 4,
    },
  ],
  variantRelation: {
    mode: "none",
    existingGroupId: "",
    mappedOptions: {},
    newGroupName: "",
    dimensions: [],
    leaderOptions: {},
  },
};
