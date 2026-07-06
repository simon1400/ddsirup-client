export interface WithdrawalPage {
  title: string;
  subtitle?: string;
  description?: string;
  warningText?: string;
  returnAddress?: string;
  seo?: import('./product').SeoComponent;
}
