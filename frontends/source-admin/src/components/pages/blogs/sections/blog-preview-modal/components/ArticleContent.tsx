"use client";

import type { ContentBlock } from "@/lib/admin/mocks/magazine";
import { useProductsQuery } from "@/hooks/admin/products";

function ProductRef({ productId, caption }: { productId: string; caption?: string }) {
  const { data: products = [] } = useProductsQuery();
  const product = products.find((p) => p.id === productId);
  if (!product) return null;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
      <img
        src={product.image}
        alt={product.name}
        className="size-16 shrink-0 rounded-xl object-cover"
      />
      <div className="flex min-w-0 flex-col">
        <span className="text-caption text-muted-foreground-lighter">{product.brand}</span>
        <span className="truncate text-xs font-semibold text-foreground">{product.name}</span>
        <span className="text-caption text-brand-accent font-semibold">${product.price}</span>
        {caption && <span className="mt-2 text-caption text-muted-foreground">{caption}</span>}
      </div>
    </div>
  );
}

export function ArticleContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h3 key={index} className="font-openrunde text-subheading text-foreground">
                {block.content}
              </h3>
            );
          case "paragraph":
            return (
              <p key={index} className="text-body text-muted-foreground leading-relaxed">
                {block.content}
              </p>
            );
          case "quote":
            return (
              <blockquote
                key={index}
                className="border-l-2 border-brand-accent pl-6 font-openrunde text-subheading italic text-foreground"
              >
                “{block.content}”
                <footer className="mt-2 text-caption not-italic text-muted-foreground-lighter">
                  — {block.author}
                </footer>
              </blockquote>
            );
          case "image_full":
            return (
              <figure key={index} className="flex flex-col gap-2">
                <img
                  src={block.url}
                  alt={block.caption ?? ""}
                  className="w-full rounded-2xl object-cover"
                />
                {block.caption && (
                  <figcaption className="text-caption text-muted-foreground-lighter">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "image_grid":
            return (
              <div key={index} className="grid grid-cols-2 gap-4">
                {block.images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={block.caption ?? ""}
                    className="aspect-square w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            );
          case "product_card":
            return <ProductRef key={index} productId={block.product_id} caption={block.caption} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
