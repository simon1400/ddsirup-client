import type { Product, ProductVariant } from './product';

export interface CartItem {
  id: string; // unique: productId + variantId
  productId: number;
  documentId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  variant?: Pick<ProductVariant, 'id' | 'name' | 'volume'>;
  stock: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  shippingWithoutVat: number;
  totalWeight: number;
  packageCount: number;
  total: number;
  itemCount: number;
}

export function cartItemFromProduct(
  product: Product,
  quantity = 1,
  variant?: ProductVariant
): CartItem {
  const variantId = variant ? `v${variant.id}` : '';
  return {
    id: `${product.id}${variantId}`,
    productId: product.id,
    documentId: product.documentId,
    name: product.name,
    slug: product.slug,
    price: variant?.price ?? product.price,
    quantity,
    thumbnail: product.images?.[0]?.url,
    variant: variant
      ? { id: variant.id, name: variant.name, volume: variant.volume }
      : undefined,
    stock: variant?.stock ?? product.stock,
  };
}
