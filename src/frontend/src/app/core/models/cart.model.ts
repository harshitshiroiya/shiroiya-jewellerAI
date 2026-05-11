export interface CartItem {
  id: string;
  productId?: string;
  customDesignId?: string;
  product?: {
    name: string;
    imageUrls: string[];
    sellingPrice: number;
  };
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
