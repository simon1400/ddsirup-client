export interface InfoPage {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content?: string;
  seo?: import('./product').SeoComponent;
}
