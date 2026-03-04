import { MapPin, Phone, Mail, Truck } from 'lucide-react';
import type { Order } from '@/types/order';

export function OrderAddresses({ order }: { order: Order }) {
  const hasDifferentShipping =
    order.shippingAddress &&
    order.billingAddress &&
    order.shippingAddress.street !== order.billingAddress.street;

  return (
    <div className="space-y-6">
      {/* Billing address */}
      {order.billingAddress ? (
        <div className="bg-green-soft/30 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-text" />
            Fakturační adresa
          </h3>
          <div className="text-sm space-y-1">
            <p className="font-medium">
              {order.customerFirstName} {order.customerLastName}
            </p>
            {order.billingAddress.company && (
              <p>{order.billingAddress.company}</p>
            )}
            <p>{order.billingAddress.street}</p>
            {order.billingAddress.streetLine2 && (
              <p>{order.billingAddress.streetLine2}</p>
            )}
            <p>
              {order.billingAddress.zip} {order.billingAddress.city}
            </p>
            {order.billingAddress.ico && (
              <p className="pt-1">IČO: {order.billingAddress.ico}</p>
            )}
            {order.billingAddress.dic && (
              <p>DIČ: {order.billingAddress.dic}</p>
            )}
          </div>
          <div className="text-sm space-y-2 mt-4 pt-4 border-t border-green-text/10">
            {order.customerPhone && (
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                {order.customerPhone}
              </p>
            )}
            <p className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              {order.customerEmail}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-soft/30 rounded-2xl p-6">
          <div className="text-sm space-y-2">
            {order.customerPhone && (
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                {order.customerPhone}
              </p>
            )}
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              {order.customerEmail}
            </p>
          </div>
        </div>
      )}

      {/* Shipping address (if different) */}
      {hasDifferentShipping && (
        <div className="bg-category-yellow/20 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-yellow-700" />
            Doručovací adresa
          </h3>
          <div className="text-sm space-y-1">
            {order.shippingAddress.company && (
              <p className="font-medium">{order.shippingAddress.company}</p>
            )}
            <p>{order.shippingAddress.street}</p>
            {order.shippingAddress.streetLine2 && (
              <p>{order.shippingAddress.streetLine2}</p>
            )}
            <p>
              {order.shippingAddress.zip} {order.shippingAddress.city}
            </p>
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="bg-muted/50 rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
            Poznámky
          </h3>
          <p className="text-sm">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
