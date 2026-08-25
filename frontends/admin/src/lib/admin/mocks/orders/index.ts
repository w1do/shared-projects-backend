import ordersRaw from "./data.json";
import type { DetailedOrder, DetailedOrderItem } from "./types";
import { productsCatalog } from "../catalog";
import { hashString } from "../source/catalog-source";
import { findCustomerByEmailOrName } from "../customers";

export * from "./types";

const TAX_RATE = 0.1;
const round2 = (value: number) => Math.round(value * 100) / 100;

type CatalogProduct = (typeof productsCatalog)[number];

/** Project a live catalog product onto the order line-item shape. */
function toOrderItem(product: CatalogProduct, quantity: number): DetailedOrderItem {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    sku: product.sku,
    price: product.price,
    quantity,
    image: product.image,
    gradient: product.gradient,
  };
}

/**
 * Pick a distinct set of catalog products for an order, deterministically
 * derived from the order id so the generated dataset stays stable.
 */
function pickProductsForOrder(orderId: string, count: number): CatalogProduct[] {
  const total = productsCatalog.length;
  const start = hashString(orderId) % total;
  return Array.from({ length: count }, (_, index) => productsCatalog[(start + index) % total]);
}

/**
 * Order line items are sourced from the live product catalog so names, brands,
 * SKUs, prices and imagery stay in sync with the rest of the admin. The raw
 * JSON keeps customer, logistics and timeline data; quantities and the discount
 * ratio are preserved, while monetary totals are recomputed from real prices.
 */
export const mockDetailedOrders: DetailedOrder[] = (ordersRaw as DetailedOrder[]).map((order) => {
  const quantities = order.items.map((item) => item.quantity);
  const products = pickProductsForOrder(order.id, quantities.length);
  const items = products.map((product, index) => toOrderItem(product, quantities[index]));

  const subtotal = round2(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const tax = round2(subtotal * TAX_RATE);
  const discountRatio = order.subtotal > 0 ? order.discount / order.subtotal : 0;
  const discount = round2(subtotal * discountRatio);
  const total = round2(subtotal + order.shippingFee + tax - discount);

  const matchedCustomer = findCustomerByEmailOrName(order.customer.email);

  return {
    ...order,
    customer: {
      ...order.customer,
      avatarUrl: matchedCustomer?.avatarUrl,
    },
    items,
    subtotal,
    tax,
    discount,
    total,
  };
});
