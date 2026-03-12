import Link from 'next/link';
import type { Order } from '@/types/order';
import { formatPrice, getPaymentLabel, getShippingLabel, getProductUrl } from '@/lib/utils';

export function OrderDetailsCard({ order }: { order: Order }) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-xl font-bold mb-4">Podrobnosti objednávky</h2>

        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-3 border-b">
          <span className="col-span-6">Produkt</span>
          <span className="col-span-2 text-right">Cena</span>
          <span className="col-span-2 text-center">Množství</span>
          <span className="col-span-2 text-right">Celkem</span>
        </div>

        {/* Items */}
        <div className="divide-y">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 py-4 items-center text-sm"
            >
              <div className="col-span-12 sm:col-span-6">
                <Link
                  href={getProductUrl(item.productSlug, item.productCategorySlug)}
                  className="font-bold text-coral underline hover:underline"
                >
                  {item.productName}
                </Link>
                {item.variantName && (
                  <span className="text-muted-foreground ml-1">
                    — {item.variantName}
                  </span>
                )}
              </div>
              <div className="col-span-4 sm:col-span-2 text-right text-muted-foreground">
                {formatPrice(item.unitPrice)}
              </div>
              <div className="col-span-4 sm:col-span-2 text-center">
                {item.quantity}×
              </div>
              <div className="col-span-4 sm:col-span-2 text-right font-medium text-coral">
                {formatPrice(item.totalPrice)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t pt-4 mt-2 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mezisoučet</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountAmount && order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>
                Sleva{order.couponCode ? ` (${order.couponCode})` : ''}
              </span>
              <span>−{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Doprava</span>
            <span>{getShippingLabel(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Způsob platby</span>
            <span>{getPaymentLabel(order.paymentMethod)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Cena celkem</span>
            <span className="text-coral">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Extra info */}
      {(order.customerForChildren !== undefined ||
        order.customerForBar !== undefined) && (
        <div className="bg-white rounded-2xl border p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Nakupuji pro děti?</span>
              <span className="sm:ml-2 font-medium">
                {order.customerForChildren ? 'Ano' : 'Ne'}
              </span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Nakupuji pro bar?</span>
              <span className="sm:ml-2 font-medium">
                {order.customerForBar ? 'Ano' : 'Ne'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
