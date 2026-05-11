export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subTotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  orderItems: OrderItem[];
  statusHistory: OrderStatusEntry[];
}

export type OrderStatus =
  | 'Confirmed'
  | 'DesignApproved'
  | 'InProduction'
  | 'QualityCheck'
  | 'Dispatched'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  id: string;
  productId?: string;
  customDesignId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: string;
}

export interface OrderStatusEntry {
  fromStatus: string;
  toStatus: string;
  notes?: string;
  createdAt: string;
}

export interface Address {
  id?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}
