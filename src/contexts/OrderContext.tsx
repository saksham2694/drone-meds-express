
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem, Address } from '@/types';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (items: CartItem[], address: Address) => Promise<Order>;
  getOrderById: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { user } = useAuth();

  // Load orders from localStorage on initial load
  useEffect(() => {
    if (user) {
      const savedOrders = localStorage.getItem(`orders-${user.id}`);
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders));
        } catch (error) {
          console.error('Failed to parse orders from localStorage', error);
        }
      }
    }
  }, [user]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`orders-${user.id}`, JSON.stringify(orders));
    }
  }, [orders, user]);

  // Update current order progress
  useEffect(() => {
    if (currentOrder && currentOrder.status === 'in-transit') {
      const interval = setInterval(() => {
        setCurrentOrder(prevOrder => {
          if (!prevOrder) return null;
          
          const newProgress = prevOrder.deliveryProgress + 1;
          
          if (newProgress >= 100) {
            // Order delivered
            const updatedOrder = {
              ...prevOrder,
              deliveryProgress: 100,
              status: 'delivered' as const
            };
            
            // Update in orders list
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order.id === updatedOrder.id ? updatedOrder : order
              )
            );
            
            toast.success("Your order has been delivered!");
            return updatedOrder;
          }
          
          return {
            ...prevOrder,
            deliveryProgress: newProgress
          };
        });
      }, 1000); // Update every second for demo
      
      return () => clearInterval(interval);
    }
  }, [currentOrder]);

  const createOrder = async (items: CartItem[], address: Address): Promise<Order> => {
    if (!user) throw new Error('User must be logged in to place an order');
    
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const eta = 5; // 5 minutes ETA
    
    const newOrder: Order = {
      id: uuidv4(),
      userId: user.id,
      items,
      total,
      status: 'in-transit',
      createdAt: new Date().toISOString(),
      address,
      eta,
      deliveryProgress: 0
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
    setCurrentOrder(newOrder);
    
    return newOrder;
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  return (
    <OrderContext.Provider value={{
      orders,
      currentOrder,
      createOrder,
      getOrderById,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
