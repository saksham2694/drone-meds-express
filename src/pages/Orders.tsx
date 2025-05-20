
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrders } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/auth/LoginModal";
import { ArrowLeft, IndianRupee } from "lucide-react";

export default function Orders() {
  const { orders } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // If not logged in, show login modal
  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to view your order history
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
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground">
            View and track your past orders
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet.
              </p>
              <Link to="/">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Order #{order.id.substring(0, 8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          order.status === 'delivered'
                            ? 'default'
                            : order.status === 'in-transit'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {order.status === 'delivered'
                          ? 'Delivered'
                          : order.status === 'in-transit'
                          ? 'In Transit'
                          : 'Processing'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <h4 className="font-medium mb-2 text-sm">
                          Items ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="text-sm bg-secondary px-3 py-1 rounded"
                            >
                              {item.name} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end justify-between">
                        <div className="font-semibold flex items-center">
                          Total: <IndianRupee className="h-3.5 w-3.5 ml-1 mr-0.5" />{order.total.toFixed(2)}
                        </div>
                        <Link to={`/tracking/${order.id}`}>
                          <Button
                            variant={
                              order.status === 'in-transit' ? 'default' : 'outline'
                            }
                            size="sm"
                          >
                            {order.status === 'in-transit'
                              ? 'Track Order'
                              : 'View Details'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
