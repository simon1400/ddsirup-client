import type { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export function ProductGrid({ products, emptyMessage = 'Žádné produkty nebyly nalezeny.' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
