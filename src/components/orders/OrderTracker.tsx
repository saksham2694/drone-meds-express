
import { useEffect, useState } from "react";
import { Order } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrderTrackerProps {
  order: Order;
}

export default function OrderTracker({ order }: OrderTrackerProps) {
  const [dronePosition, setDronePosition] = useState({ x: 10, y: 50 });
  const [mapZoom, setMapZoom] = useState(14);

  // Calculate remaining time based on progress
  const remainingMinutes = Math.ceil(order.eta * (1 - order.deliveryProgress / 100));

  // Simulate drone movement
  useEffect(() => {
    if (order.status === 'in-transit') {
      // Calculate progress percentage for animation
      const progress = order.deliveryProgress;
      
      // Simple movement logic - drone moves from left to right
      setDronePosition({
        x: 10 + (progress * 0.8), // Move from 10% to 90% based on progress
        y: 50 + Math.sin(progress * 0.1) * 10 // Add some "flying" wave effect
      });

      // Zoom in as drone gets closer
      setMapZoom(14 + (progress / 100) * 4);
    }
  }, [order.deliveryProgress, order.status]);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Order #{order.id.substring(0, 8)}</h3>
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

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Delivery Progress</span>
            <span className="text-sm font-medium">{order.deliveryProgress}%</span>
          </div>
          <Progress value={order.deliveryProgress} className="h-2" />
        </div>

        <div className="bg-secondary rounded-lg p-1 relative overflow-hidden" style={{ height: "200px" }}>
          {/* Simple mock map */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{
              backgroundImage:
                "url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+555555(-122.4194,37.7749)/-122.4194,37.7749,13/500x300?access_token=pk.eyJ1IjoibWVkaWRyb25lIiwiYSI6ImNsc3g4Z3ptajA5cWwyam8xNnIzNW04ZzcifQ.7OyuAQJdzDAAuJ43MFW_Cw')",
              filter: "grayscale(30%)",
            }}
          ></div>

          {/* Drone icon */}
          <div
            className={`absolute w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 ${
              order.status === 'delivered' ? '' : 'animate-drone-fly'
            }`}
            style={{
              left: `${dronePosition.x}%`,
              top: `${dronePosition.y}%`,
            }}
          >
            <img src="/drone-icon.png" alt="Drone" className="w-full h-full" />
          </div>

          {/* Destination marker */}
          <div
            className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: '90%', top: '50%' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path
                d="M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z"
                fill="#ef4444"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="10"
                r="3"
                fill="white"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {order.status === 'in-transit' && (
          <div className="text-center">
            <p className="text-sm">
              Estimated arrival in{' '}
              <span className="font-semibold">
                {remainingMinutes} {remainingMinutes === 1 ? 'minute' : 'minutes'}
              </span>
            </p>
          </div>
        )}

        {order.status === 'delivered' && (
          <div className="text-center font-medium text-green-600">
            Order delivered successfully!
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Delivery Address:</h4>
          <address className="text-sm not-italic text-muted-foreground">
            {order.address.street}<br />
            {order.address.city}, {order.address.state} {order.address.zipCode}
          </address>
        </div>
      </div>
    </Card>
  );
}
