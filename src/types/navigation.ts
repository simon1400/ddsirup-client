export interface NavCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  sortOrder?: number;
  children?: NavCategory[];
}

export interface NavigationItem {
  id: number;
  label: string;
  url?: string;
  openInNewTab?: boolean;
  category?: NavCategory;
}
