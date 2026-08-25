import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import type { Brand } from "@/lib/admin/mocks/types";

export const defaultBrandFormValues: BrandFormValues = {
  name: "",
  monogram: "",
  description: "",
  origin: "",
  revenue: 0,
  share: 0,
  delta: 0,
  status: "Active",
  logo: [],
  banner: [],
  thumbnail: "",
  isFeatured: false,
  metaTitle: "",
  metaDescription: "",
};

export const sampleBrandFormValues: BrandFormValues = {
  name: "HERA",
  monogram: "He",
  description:
    "HERA is a luxury contemporary beauty brand from Seoul, defining the standards of K-Beauty. It presents sophisticated, high-performance makeup and skincare routines that empower modern individuals to express their authentic beauty.",
  origin: "South Korea",
  revenue: 154000,
  share: 23.5,
  delta: 14.8,
  status: "Active",
  logo: ["/brands/logos/velvet-hour.webp"],
  banner: ["/brands/thumbnails/velvet-hour.webp"],
  thumbnail: "/brands/thumbnails/velvet-hour.webp",
  isFeatured: true,
  metaTitle: "HERA Cosmetics | Contemporary Seoul Luxury",
  metaDescription:
    "Explore HERA's premium makeup and skincare collections. Experience advanced beauty formulas inspired by contemporary Seoul style.",
};

export function generateBrandMonogram(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "";
  }

  const monogram =
    words.length >= 2 ? `${words[0].charAt(0)}${words[1].charAt(0)}` : words[0].slice(0, 2);

  return monogram.charAt(0).toUpperCase() + monogram.slice(1).toLowerCase();
}

export function createBrandId(name: string, existingIds: string[] = []) {
  const baseId =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "brand";

  if (!existingIds.includes(baseId)) {
    return baseId;
  }

  let suffix = 2;
  let nextId = `${baseId}-${suffix}`;

  while (existingIds.includes(nextId)) {
    suffix += 1;
    nextId = `${baseId}-${suffix}`;
  }

  return nextId;
}

export function createBrandFromForm(values: BrandFormValues, existingIds: string[] = []): Brand {
  const name = values.name.trim();

  return {
    id: createBrandId(name, existingIds),
    name,
    monogram: values.monogram?.trim() || generateBrandMonogram(name),
    revenue: values.revenue,
    share: values.share,
    delta: values.delta,
    trend: createTrendFromGrowth(values.delta),
  };
}

export function mergeBrandWithFormValues(brand: Brand, values: BrandFormValues): Brand {
  const name = values.name.trim();

  return {
    ...brand,
    name,
    monogram: values.monogram?.trim() || generateBrandMonogram(name),
    revenue: values.revenue,
    share: values.share,
    delta: values.delta,
    trend: brand.trend.length > 0 ? brand.trend : createTrendFromGrowth(values.delta),
  };
}

export function createBrandFormValues(brand: Brand, details: Partial<BrandFormValues> = {}) {
  return {
    ...defaultBrandFormValues,
    description: `${brand.name} is a leading cosmetics brand specializing in luxury beauty solutions.`,
    origin: "South Korea",
    status: "Active",
    isFeatured: brand.share > 15,
    metaTitle: `${brand.name} | Premium Luxury Cosmetics`,
    metaDescription: `Discover the luxury cosmetics and skincare lines from ${brand.name}.`,
    ...details,
    name: brand.name,
    monogram: brand.monogram,
    revenue: brand.revenue,
    share: brand.share,
    delta: brand.delta,
  } satisfies BrandFormValues;
}

function createTrendFromGrowth(delta: number) {
  const direction = delta >= 0 ? 1 : -1;
  const start = 18;

  return Array.from({ length: 12 }, (_, index) => start + direction * index * 2);
}
