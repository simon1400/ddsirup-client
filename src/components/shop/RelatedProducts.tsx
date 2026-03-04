import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";

interface RelatedProductsProps {
  products: Product[];
  className?: string;
}

export default function RelatedProducts({ products, className }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className={cn("my-25", className)}>
      <h2 className="text-3xl md:text-5xl font-bold text-center mb-6">
        Související produkty
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
