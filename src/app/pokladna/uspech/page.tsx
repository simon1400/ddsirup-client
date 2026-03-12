import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle,
  Package,
  Calendar,
  Mail,
  CreditCard,
  Banknote,
  ArrowRight,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/Container';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { OrderMetaCard } from '@/components/checkout/success/OrderMetaCard';
import { OrderDetailsCard } from '@/components/checkout/success/OrderDetailsCard';
import { OrderAddresses } from '@/components/checkout/success/OrderAddresses';
import { getOrderByNumber, getGlobalInfo } from '@/lib/strapi';
import { formatPrice, getPaymentLabel } from '@/lib/utils';
import { FacebookPurchase } from '@/components/tracking/FacebookPurchase';

export const metadata: Metadata = {
  title: 'Objednávka přijata',
  robots: { index: false, follow: false },
};

interface SuccessPageProps {
  searchParams: Promise<{ order?: string; transId?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const [order, globalInfo] = await Promise.all([
    params.order ? getOrderByNumber(params.order) : null,
    getGlobalInfo(),
  ]);
  const vatRate = globalInfo?.vatRate ?? 12;

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
            <OrderDetailsCard order={order} vatRate={vatRate} />
            <OrderAddresses order={order} />
          </div>
        )}

        {order && (
          <FacebookPurchase
            orderId={order.orderNumber}
            value={order.total}
            items={order.items.map((i: { productSlug: string; quantity: number }) => ({
              productSlug: i.productSlug,
              quantity: i.quantity,
            }))}
            email={order.customerEmail}
            phone={order.customerPhone}
            firstName={order.customerFirstName}
            lastName={order.customerLastName}
            city={order.billingAddress?.city}
            zip={order.billingAddress?.zip}
          />
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="bg-coral hover:bg-coral/90 text-white font-bold uppercase tracking-wider rounded-full h-12 px-8"
          >
            <Link href="/pro-kazdeho">
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
