import { z } from 'zod';

export const ZIP_REGEX = /^\d{3}\s?\d{2}$/;

export const PAYMENT_METHODS = [
  { id: 'ALL', label: 'Comgate', description: 'Všechny platební metody' },
  { id: 'CARD_ALL', label: 'Platební kartou', description: 'Visa, Mastercard' },
  { id: 'GPAY', label: 'Google Pay', description: '' },
  { id: 'BANK_ALL', label: 'Rychlá platba online převodem', description: '' },
] as const;

const billingAddressSchema = z.object({
  street: z.string().min(3, { message: 'Ulice je povinná' }),
  streetLine2: z.string().optional(),
  city: z.string().min(2, { message: 'Město je povinné' }),
  zip: z.string().refine((v) => ZIP_REGEX.test(v), { message: 'Neplatné PSČ (formát: 123 45)' }),
  country: z.string(),
  company: z.string().optional(),
  ico: z.string().optional(),
  dic: z.string().optional(),
});

const shippingAddressSchema = z.object({
  street: z.string().optional(),
  streetLine2: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string(),
  company: z.string().optional(),
});

export const checkoutSchema = z.object({
  firstName: z.string().min(2, { message: 'Jméno je povinné' }),
  lastName: z.string().min(2, { message: 'Příjmení je povinné' }),
  email: z.string().email({ message: 'Neplatný e-mail' }),
  phone: z.string().min(9, { message: 'Telefon je povinný' }),
  billingAddress: billingAddressSchema,
  shipToDifferentAddress: z.boolean(),
  shippingAddress: shippingAddressSchema.optional(),
  notes: z.string().optional(),
  forChildren: z.string(),
  forBar: z.string(),
  paymentMethod: z.string(),
  agreedToTerms: z.boolean().refine((v) => v === true, {
    message: 'Musíte souhlasit s obchodními podmínkami',
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
