export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  categoryId: string;
  category?: Category;
  jewelleryType: string;
  metalType: string;
  purity: string;
  weightInGrams: number;
  stoneType: string;
  stoneShape?: string;
  stoneColor?: string;
  stoneClarity?: string;
  stoneCarat?: number;
  basePrice: number;
  sellingPrice: number;
  discountPercent: number;
  stockQuantity: number;
  imageUrls: string[];
  threeDModelUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  displayOrder: number;
  parentCategoryId?: string;
  subCategories?: Category[];
}

export interface ProductListResponse {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ProductFilter {
  category?: string;
  metal?: string;
  stone?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}
