
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import Navbar from "@/components/layout/Navbar";
import CartItemComponent from "@/components/cart/CartItem";
import { Address } from "@/types";
import { toast } from "sonner";
import LoginModal from "@/components/auth/LoginModal";
import { ArrowLeft } from "lucide-react";

export default function Cart() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Simple validation
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      toast.error("Please fill in all address fields");
      return;
    }
    
    try {
      setLoading(true);
      const order = await createOrder(items, address);
      clearCart();
      navigate(`/tracking/${order.id}`);
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error("Failed to place order");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any medicines to your cart yet.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
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
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <p className="text-muted-foreground">
            Review your items and provide delivery details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
              <div className="space-y-1">
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary and Checkout */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 divide-y divide-border">
              <div className="pb-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>Free</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={address.state}
                        onChange={(e) =>
                          setAddress({ ...address, state: e.target.value })
                        }
                        placeholder="NY"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        value={address.zipCode}
                        onChange={(e) =>
                          setAddress({ ...address, zipCode: e.target.value })
                        }
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full mt-6"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showLoginModal && (
        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      )}
    </div>
  );
}
