export type ICategory = {
  _id: string;
  name: string;
  subCategoryCount:number;
  slug: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: string;
};
