
import React, { createContext, useContext, useState, useEffect } from "react";
import { Order, CartItem, Address } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: Error | null;
  fetchOrders: () => Promise<void>;
  createOrder: (items: CartItem[], address: Address) => Promise<Order>;
  currentOrder: Order | null;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  loading: false,
  error: null,
  fetchOrders: async () => {},
  createOrder: async () => {
    throw new Error("OrderContext not initialized");
  },
  currentOrder: null,
});

export const useOrders = () => useContext(OrderContext);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { user } = useAuth();

  // Parse JSON data from Supabase into the correct types
  const parseOrderData = (data: any): Order => {
    // Convert items from JSON to CartItem array
    const itemsArray = (data.items as Json[]).map((item: any) => ({
      id: item.id as string,
      name: item.name as string,
      description: item.description as string,
      price: item.price as number,
      imageUrl: item.imageUrl as string,
      category: item.category as string,
      quantity: item.quantity as number,
    }));

    return {
      id: data.id,
      userId: data.user_id,
      items: itemsArray,
      status: data.status,
      total: data.total,
      createdAt: new Date(data.created_at).toISOString(), // Convert Date to string
      address: data.address as Address,
      deliveryProgress: data.delivery_progress,
      eta: data.eta,
    };
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const parsedOrders = data.map(parseOrderData);
        setOrders(parsedOrders);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (
    items: CartItem[],
    address: Address
  ): Promise<Order> => {
    if (!user) {
      throw new Error("User must be logged in to create an order");
    }

    try {
      setLoading(true);

      // Calculate total price
      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Generate a random ETA (10-30 minutes)
      const eta = Math.floor(Math.random() * 21) + 10;

      // Insert data with the correct format
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          items: items as unknown as Json,
          status: "processing",
          total: total,
          address: address as unknown as Json,
          delivery_progress: 0,
          eta: eta,
        })
        .select()
        .single();

      if (error) throw error;

      const createdOrder = parseOrderData(data);
      setOrders((prev) => [createdOrder, ...prev]);
      setCurrentOrder(createdOrder);

      return createdOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      toast.error("Failed to create order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when user changes
  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        fetchOrders,
        createOrder,
        currentOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;
