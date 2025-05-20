
import { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import { CartItem, Order, Address } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OrderContextType {
  orders: Order[];
  placeOrder: (items: CartItem[], address: Address) => Promise<Order>;
  simulateDelivery: (orderId: string) => void;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  // Fetch orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          return;
        }

        if (data) {
          // Transform the snake_case column names to camelCase for our frontend
          const transformedOrders = data.map(order => ({
            id: order.id,
            userId: order.user_id,
            items: order.items as CartItem[],
            total: order.total,
            status: order.status === 'processing' ? 'pending' : order.status as "pending" | "in-transit" | "delivered",
            createdAt: order.created_at,
            address: order.address as unknown as Address,
            eta: order.eta,
            deliveryProgress: order.delivery_progress
          })) as Order[];
          
          setOrders(transformedOrders);
        }
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Simulate delivery progress
  const simulateDelivery = (orderId: string) => {
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return;

    const prevOrder = orders[orderIndex];
    
    // Only simulate delivery for orders in "pending" status
    if (prevOrder.status !== 'pending') return;

    // Start delivery simulation
    const simulationInterval = setInterval(() => {
      setOrders(prevOrders => {
        const orderIndex = prevOrders.findIndex(order => order.id === orderId);
        if (orderIndex === -1) {
          clearInterval(simulationInterval);
          return prevOrders;
        }

        const prevOrder = prevOrders[orderIndex];
        const newProgress = Math.min(prevOrder.deliveryProgress + 10, 100);
        
        // Create a new order with updated progress
        const updatedOrder = {
          ...prevOrder,
          deliveryProgress: newProgress,
          status: newProgress === 100 ? 'delivered' : prevOrder.status
        };

        // If delivery is complete, mark as delivered and stop the simulation
        if (newProgress === 100) {
          clearInterval(simulationInterval);
          
          // Update status in Supabase
          supabase
            .from('orders')
            .update({ 
              delivery_progress: 100, 
              status: 'delivered' 
            })
            .eq('id', updatedOrder.id)
            .then(({ error }) => {
              if (error) console.error('Failed to update order status in Supabase', error);
            });
        } else {
          // Update progress in Supabase
          supabase
            .from('orders')
            .update({ delivery_progress: newProgress })
            .eq('id', prevOrder.id)
            .then(({ error }) => {
              if (error) console.error('Failed to update order progress in Supabase', error);
            });
        }

        // Update orders in state
        const newOrders = [...prevOrders];
        newOrders[orderIndex] = updatedOrder;
        return newOrders;
      });
    }, 2000); // Update every 2 seconds
  };

  // Place a new order
  const placeOrder = async (items: CartItem[], address: Address) => {
    if (!user) throw new Error('User must be logged in to place an order');
    
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const eta = 5; // 5 minutes ETA
    
    // Use built-in crypto API to generate UUID instead of uuid package
    const orderId = crypto.randomUUID();
    
    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      address,
      eta,
      deliveryProgress: 0
    };
    
    try {
      // Insert into Supabase with snake_case column names
      const { error } = await supabase
        .from('orders')
        .insert({
          id: newOrder.id,
          user_id: newOrder.userId,
          items: newOrder.items,
          total: newOrder.total,
          status: newOrder.status,
          created_at: newOrder.createdAt,
          address: newOrder.address,
          eta: newOrder.eta,
          delivery_progress: newOrder.deliveryProgress
        });
      
      if (error) {
        console.error('Failed to save order to Supabase', error);
        throw error;
      }
      
      // Update local state
      setOrders(prev => [newOrder, ...prev]);
      
      return newOrder;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder, simulateDelivery, isLoading }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
