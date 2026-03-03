import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Objednávka přijata',
};

interface SuccessPageProps {
  searchParams: Promise<{ order?: string; transId?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  return (
    <Container size="xs" className="py-16 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-3">Děkujeme za objednávku!</h1>

      {params.order && (
        <p className="text-muted-foreground mb-2">
          Číslo objednávky: <span className="font-medium text-foreground">{params.order}</span>
        </p>
      )}

      <p className="text-muted-foreground mb-8">
        Potvrzení objednávky bylo odesláno na váš e-mail.
      </p>

      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link href="/products">Pokračovat v nákupu</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Zpět na hlavní stránku</Link>
        </Button>
      </div>
    </Container>
  );
}
