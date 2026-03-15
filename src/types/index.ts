export interface MenuItem {
  id: string;
  name: string;
  price: string | number;
  description?: string;
  image?: string;
  category?: string;
}

export interface MenuCategory {
  title: string;
  category: string;
  items: MenuItem[];
}

export interface PopularDish {
  name: string;
  description: string;
  image: string;
}

export interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
}

export interface Reservation {
  name: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: CartItem[];
  total_price: number;
  order_status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  delivery_requested: boolean;
  created_at: string;
  updated_at: string;
}
