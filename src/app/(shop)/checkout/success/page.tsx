import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle,
  Package,
  Calendar,
  Mail,
  CreditCard,
  MapPin,
  Phone,
  ArrowRight,
  Home,
  Truck,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/Container';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { getOrderByNumber } from '@/lib/strapi';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Objednávka přijata',
};

interface SuccessPageProps {
  searchParams: Promise<{ order?: string; transId?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const order = params.order ? await getOrderByNumber(params.order) : null;

  return (
    <div className="py-8 min-h-screen">
      <Container>
        <CheckoutStepper activeStep={2} />
      </Container>

      <Container size="lg">
        {/* Hero confirmation */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-soft mb-5">
            <CheckCircle className="h-10 w-10 text-green-text" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Děkujeme za objednávku!
          </h1>
          <p className="text-muted-foreground text-lg">
            Potvrzení objednávky bylo odesláno na váš e-mail.
          </p>
        </div>

        {/* Order meta strip */}
        {order && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            <OrderMetaCard
              icon={<Package className="w-5 h-5" />}
              label="Číslo objednávky"
              value={order.orderNumber}
            />
            <OrderMetaCard
              icon={<Calendar className="w-5 h-5" />}
              label="Datum"
              value={new Date(order.createdAt).toLocaleDateString('cs-CZ')}
            />
            <OrderMetaCard
              icon={<Mail className="w-5 h-5" />}
              label="E-mail"
              value={order.customerEmail}
            />
            <OrderMetaCard
              icon={<Banknote className="w-5 h-5" />}
              label="Cena celkem"
              value={formatPrice(order.total)}
              highlight
            />
            <OrderMetaCard
              icon={<CreditCard className="w-5 h-5" />}
              label="Způsob platby"
              value={getPaymentLabel(order.paymentMethod)}
            />
          </div>
        )}

        {/* Fallback when order not found */}
        {!order && params.order && (
          <div className="bg-green-soft/40 rounded-2xl p-6 mb-10 text-center">
            <p className="text-green-text font-medium">
              Číslo objednávky:{' '}
              <span className="font-bold">{params.order}</span>
            </p>
          </div>
        )}

        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Order items — left 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border p-6">
                <h2 className="text-xl font-bold mb-4">
                  Podrobnosti objednávky
                </h2>

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
                          href={`/products/${item.productSlug}`}
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
                    <span>
                      {getShippingLabel(order.shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Způsob platby</span>
                    <span>{getPaymentLabel(order.paymentMethod)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Cena celkem</span>
                    <span className="text-coral">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Extra info */}
              {(order.customerForChildren !== undefined ||
                order.customerForBar !== undefined) && (
                <div className="bg-white rounded-2xl border p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between sm:block">
                      <span className="text-muted-foreground">
                        Nakupuji pro děti?
                      </span>
                      <span className="sm:ml-2 font-medium">
                        {order.customerForChildren ? 'Ano' : 'Ne'}
                      </span>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-muted-foreground">
                        Nakupuji pro bar?
                      </span>
                      <span className="sm:ml-2 font-medium">
                        {order.customerForBar ? 'Ano' : 'Ne'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar — Address & Info */}
            <div className="space-y-6">
              {/* Billing address */}
              {order.billingAddress && (
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
              )}

              {/* Contact info fallback (when no billing address) */}
              {!order.billingAddress && (
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
              {order.shippingAddress &&
                order.billingAddress &&
                order.shippingAddress.street !==
                  order.billingAddress.street && (
                  <div className="bg-category-yellow/20 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-yellow-700" />
                      Doručovací adresa
                    </h3>
                    <div className="text-sm space-y-1">
                      {order.shippingAddress.company && (
                        <p className="font-medium">
                          {order.shippingAddress.company}
                        </p>
                      )}
                      <p>{order.shippingAddress.street}</p>
                      {order.shippingAddress.streetLine2 && (
                        <p>{order.shippingAddress.streetLine2}</p>
                      )}
                      <p>
                        {order.shippingAddress.zip}{' '}
                        {order.shippingAddress.city}
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
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="bg-coral hover:bg-coral/90 text-white font-bold uppercase tracking-wider rounded-full h-12 px-8"
          >
            <Link href="/products">
              Pokračovat v nákupu
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full h-12 px-8">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Zpět na hlavní stránku
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}

function OrderMetaCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-muted/50 rounded-2xl p-4 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white mb-2">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`font-bold text-md truncate ${highlight ? 'text-coral' : ''}`}>{value}</p>
    </div>
  );
}

function getShippingLabel(cost: number): string {
  if (cost === 0) return 'Místní vyzvednutí';
  return `Doručení (${cost} Kč)`;
}

function getPaymentLabel(method?: string): string {
  switch (method) {
    case 'CARD_ALL':
      return 'Platební karta';
    case 'BANK_ALL':
      return 'Bankovní převod';
    case 'GPAY':
      return 'Google Pay';
    case 'TEST':
      return 'Testovací platba';
    case 'ALL':
    default:
      return 'Comgate';
  }
}
