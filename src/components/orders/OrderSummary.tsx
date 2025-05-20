
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IndianRupee } from "lucide-react";

interface OrderSummaryProps {
  order: Order;
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span className="font-medium flex items-center">
                <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="flex items-center">
              <IndianRupee className="h-4 w-4 mr-0.5" />
              {order.total.toFixed(2)}
            </span>
          </div>
          
          <div className="pt-2 text-xs text-muted-foreground">
            <p>Order ID: {order.id.substring(0, 8)}</p>
            <p>Order Date: {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
