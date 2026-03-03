import type { Product, ProductInfoBox } from '@/types/product';
import { ProductCard } from '@/components/shop/ProductCard';
import { INFO_BOX_COLORS } from '@/lib/constants';

function InfoBox({ box, index }: { box: ProductInfoBox; index: number }) {
  const color = INFO_BOX_COLORS[index % INFO_BOX_COLORS.length];
  const lines = box.content.split('\n').filter(Boolean);

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: color.bg }}>
      <h3 className="font-bold text-lg mb-3" style={{ color: color.text }}>
        {box.title}
      </h3>
      <ul className="space-y-1">
        {lines.map((line, i) => (
          <li key={i} className="text-sm flex gap-2" style={{ color: color.text }}>
            <span>•</span>
            <span>{line.replace(/^[-•]\s*/, '')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ProductInfoSectionsProps {
  product: Product;
}

export function ProductInfoSections({ product }: ProductInfoSectionsProps) {
  const hasBoxes = product.infoBoxes && product.infoBoxes.length > 0;
  const hasFooter = product.ingredients || product.countryOfOrigin || product.madeIn;
  const hasRelated = product.relatedProducts && product.relatedProducts.length > 0;

  if (!hasBoxes && !hasFooter && !hasRelated) return null;

  return (
    <div className="mt-12 space-y-10">
      {hasBoxes && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {product.infoBoxes!.map((box, i) => (
            <InfoBox key={box.id} box={box} index={i} />
          ))}
        </div>
      )}

      {hasFooter && (
        <div className="text-center text-sm text-muted-foreground space-y-1">
          {product.ingredients && (
            <p>Složení: {product.ingredients}</p>
          )}
          {(product.countryOfOrigin || product.madeIn) && (
            <p>
              {product.countryOfOrigin && `Země původu: ${product.countryOfOrigin}`}
              {product.countryOfOrigin && product.madeIn && '  '}
              {product.madeIn && `Vyrobeno: ${product.madeIn}`}
            </p>
          )}
        </div>
      )}

      {hasRelated && (
        <div>
          <h2 className="text-xl font-bold text-center mb-6">Související produkty</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.relatedProducts!.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
