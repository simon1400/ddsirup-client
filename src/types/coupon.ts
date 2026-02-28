export interface AppliedCoupon {
  documentId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number | null;
  description: string | null;
}

export interface CouponValidateResponse {
  data: AppliedCoupon & { discountAmount: number };
}
