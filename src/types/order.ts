export interface OrderItem {
  id: number;
  productName: string;
  productSlug: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  thumbnail?: string;
  variantName?: string;
  variantVolume?: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'refunded'
  | 'processing'
  | 'shipped'
  | 'delivered';

export interface Address {
  street: string;
  streetLine2?: string;
  city: string;
  zip: string;
  country: string;
  company?: string;
  ico?: string;
  dic?: string;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  billingAddress: Address;
  shipToDifferentAddress: boolean;
  shippingAddress?: Omit<Address, 'ico' | 'dic'>;
  notes?: string;
  forChildren: string;
  forBar: string;
  paymentMethod: string;
  agreedToTerms: boolean;
}

export interface Order {
  id: number;
  documentId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  shippingAddress: Address;
  billingAddress: Address;
  comgateTransId?: string;
  comgateStatus?: string;
  notes?: string;
  couponCode?: string;
  discountAmount?: number;
  paymentMethod?: string;
  customerForChildren?: boolean;
  customerForBar?: boolean;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  orderNumber: string;
  orderStatus: OrderStatus;
  items: Omit<OrderItem, 'id'>[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  couponCode?: string;
  discountAmount?: number;
  paymentMethod?: string;
  customerForChildren?: boolean;
  customerForBar?: boolean;
}
