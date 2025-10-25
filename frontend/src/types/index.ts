export interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'customer' | 'seller' | 'admin';
  phone_number?: string;
  avatar?: string;
  preferences: Record<string, any>;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  compare_price?: number;
  category: Category;
  seller: User;
  eco_score?: number;
  images: ProductImage[];
  sustainability_certifications: string[];
  is_organic: boolean;
  is_vegan: boolean;
  is_cruelty_free: boolean;
  carbon_footprint?: number;
  quantity: number;
  average_rating?: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image?: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  total_price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  total: number;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}