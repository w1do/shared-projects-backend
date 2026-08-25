/**
 * Brand catalog content sourced from the BlushNest dataset.
 * This is the single source of truth for brand identity (name, story, assets).
 * Analytics figures (revenue, share, trend, delta) are synthesized in `index.ts`
 * so the dashboard, stats and PDF exports keep working with realistic numbers.
 */
export interface BrandContent {
  slug: string;
  name: string;
  slogan: string;
  description: string;
  productsCount: number;
}

export const brandContents: BrandContent[] = [
  {
    slug: "l-aura-muse",
    name: "L'Aura Muse",
    slogan: "Reveal Your Inner Light",
    description:
      "Inspired by the golden light of the French Riviera, L'Aura Muse combines ancestral beauty secrets with modern radiance-boosting technology to unveil your skin's natural halo.",
    productsCount: 3,
  },
  {
    slug: "maison-de-soie",
    name: "Maison de Soie",
    slogan: "The Softness of a Living Dream",
    description:
      "Crafting a legacy of silk-infused skincare, Maison de Soie offers a sensory journey where haute couture meets high-performance hydration for a complexion as smooth as fine silk.",
    productsCount: 1,
  },
  {
    slug: "zenith-aura",
    name: "Zenith Aura",
    slogan: "Claim Your Peak",
    description:
      "The ultimate expression of self-dominance. Zenith Aura is a bold, high-performance range for those who command the peak of their existence, wrapped in nocturnal, obsidian luxury.",
    productsCount: 2,
  },
  {
    slug: "eclat-vrai",
    name: "Éclat Vrai",
    slogan: "Pure Light. True Beauty.",
    description:
      "A tribute to transparency and absolute purity. Éclat Vrai utilizes light-refracting minerals and crystalline spring water to restore the true, unadulterated glow of your youth.",
    productsCount: 2,
  },
  {
    slug: "satin-theory",
    name: "Satin Theory",
    slogan: "The Logic of Infinite Softness",
    description:
      "Where the precision of the laboratory meets the poetry of texture. Satin Theory explores the science of surface-level perfection, delivering a flawless matte-satin finish.",
    productsCount: 2,
  },
  {
    slug: "element-07",
    name: "Element 07",
    slogan: "Precision in Every Drop",
    description:
      "A clinical powerhouse engineered for results. Element 07 utilizes high-concentration bio-actives and medical-grade delivery systems to target skin concerns with surgical precision.",
    productsCount: 2,
  },
  {
    slug: "vora-lab",
    name: "Vora Lab",
    slogan: "Engineering the Future of Youth",
    description:
      "Defining the frontier of cellular longevity. Vora Lab merges cutting-edge biotechnology with minimalist aesthetics to freeze time and engineer the future of youthful vitality.",
    productsCount: 2,
  },
  {
    slug: "silk-dew",
    name: "Silk & Dew",
    slogan: "Awaken Your Skin's Natural Rhythm",
    description:
      "A botanical sanctuary for thirsty skin. Silk & Dew captures the revitalizing power of morning dew and organic flora to synchronize your skin with nature's life-giving rhythm.",
    productsCount: 2,
  },
  {
    slug: "oura-botanica",
    name: "Oura Botanica",
    slogan: "Sacred Herbs. Timeless Glow.",
    description:
      "Harnessing the sacred energy of earth's rarest herbs. Oura Botanica provides a holistic healing experience, transmuting ancient wisdom into a timeless, spiritual glow.",
    productsCount: 2,
  },
  {
    slug: "bloom-quill",
    name: "Bloom & Quill",
    slogan: "The Artistry of Refinement",
    description:
      "Designed for the connoisseur of detail. Bloom & Quill treats skincare as a fine art, blending delicate floral essences with the refined craftsmanship of a master atelier.",
    productsCount: 2,
  },
  {
    slug: "solar-quartz",
    name: "Solar Quartz",
    slogan: "Harness the Power of Light",
    description:
      "Born from the radiant energy of crystalline minerals, Solar Quartz channels the sun's transformative power into high-performance formulas that illuminate and energize the skin from within.",
    productsCount: 5,
  },
  {
    slug: "arctic-marine",
    name: "Arctic Marine",
    slogan: "Deep Sea Vitality for Modern Skin",
    description:
      "Drawing from the pristine depths of Arctic waters, Arctic Marine harnesses rare marine minerals and glacier-born botanicals to deliver intense hydration and cellular renewal.",
    productsCount: 5,
  },
  {
    slug: "velvet-hour",
    name: "Velvet Hour",
    slogan: "Luxury in Every Nightfall",
    description:
      "A celebration of nocturnal elegance. Velvet Hour transforms your evening routine into a sensory ritual of silk-infused luxury, designed for those who embrace the restorative power of night.",
    productsCount: 5,
  },
  {
    slug: "aura-tech",
    name: "Aura Tech",
    slogan: "Digital Defense for the Modern Interface",
    description:
      "Engineered for the digital age. Aura Tech combines cutting-edge blue light protection with AI-optimized formulas to shield and repair skin from the invisible stressors of modern technology.",
    productsCount: 5,
  },
  {
    slug: "terra-nova",
    name: "Terra-Nova",
    slogan: "Bio-Hacking Nature's Intelligence",
    description:
      "Where ancient earth meets future science. Terra-Nova harnesses the adaptive power of extremophile botanicals—moss, fungi, and deep-sea algae—to create resilient, bio-active skincare.",
    productsCount: 5,
  },
  {
    slug: "clinical-core",
    name: "Clinical Core",
    slogan: "Medical-Grade Results, No Prescription Required",
    description:
      "The intersection of dermatology and accessibility. Clinical Core delivers pharmaceutical-strength actives in clinically-proven concentrations for serious skin transformation.",
    productsCount: 5,
  },
  {
    slug: "soul-sync",
    name: "Soul-Sync",
    slogan: "Where Skin Meets Serenity",
    description:
      "A mindful approach to beauty. Soul-Sync integrates therapeutic aromatherapy with high-performance skincare, creating sensory rituals that calm the mind while transforming the skin.",
    productsCount: 5,
  },
  {
    slug: "titan-tech",
    name: "Titan-Tech",
    slogan: "Fortified for the Elite",
    description:
      "Maximum defense for maximum performance. Titan-Tech delivers military-grade environmental protection in aerospace-inspired packaging, engineered for those who operate at the highest levels.",
    productsCount: 5,
  },
];
