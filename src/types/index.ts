export type Category = 'Coffees' | 'Teas' | 'Cakes' | 'Hot Chocolate';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Settings {
  maxOrdersPerSlot: number;
  blockedDates: string[];
}

export interface OrderDetails {
  id?: string;
  items: Array<{
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  total: number;
  pickupDate: string;
  pickupTime: string;
  userId: string;
  userEmail: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}