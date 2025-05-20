
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import OrderTracker from "@/components/orders/OrderTracker";
import OrderSummary from "@/components/orders/OrderSummary";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/auth/LoginModal";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function Tracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, currentOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Find the order based on the URL parameter or use the current order being tracked
  const order = orderId
    ? orders.find((o) => o.id === orderId) || currentOrder
    : currentOrder;

  // If not logged in, show login modal
  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user]);

  // If no order found, redirect to home
  useEffect(() => {
    if (!order && !showLoginModal) {
      navigate('/');
    }
  }, [order, navigate, showLoginModal]);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find the order you're looking for.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </main>
        {showLoginModal && (
          <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            className="mb-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
          <h1 className="text-3xl font-bold">Track Your Delivery</h1>
          <p className="text-muted-foreground">
            Watch as your medicine gets delivered by drone
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <OrderTracker order={order} />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary order={order} />
          </div>
        </div>
      </main>
      {showLoginModal && (
        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      )}
    </div>
  );
}
