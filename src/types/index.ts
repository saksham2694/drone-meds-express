
export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface CartItem extends Medicine {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'in-transit' | 'delivered';
  createdAt: string;
  address: Address;
  eta: number; // in minutes
  deliveryProgress: number; // 0-100
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}
