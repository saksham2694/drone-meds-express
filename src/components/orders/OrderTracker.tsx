
import { useEffect, useState, useRef } from "react";
import { Order } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrderTrackerProps {
  order: Order;
}

declare global {
  interface Window {
    google: any;
    initMap: (orderId: string) => void;
  }
}

export default function OrderTracker({ order }: OrderTrackerProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [progress, setProgress] = useState(order.deliveryProgress);
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Fixed pharmacy location (starting point)
  const PHARMACY_LOCATION = { lat: 30.6425, lng: 76.8173 }; // Amity University, Mohali, Punjab
  const PHARMACY_NAME = "MediDrone Pharmacy HQ";
  
  // Calculate remaining time based on progress and 5-minute delivery time
  const DELIVERY_TIME_MINUTES = 5;
  const remainingMinutes = Math.ceil(DELIVERY_TIME_MINUTES * (1 - progress / 100));

  // Update progress in real-time
  useEffect(() => {
    // Only run this for orders that aren't delivered yet
    if (order.status === 'delivered' || progress >= 100) return;
    
    const startTime = new Date(order.createdAt).getTime();
    const deliveryTimeMs = DELIVERY_TIME_MINUTES * 60 * 1000; // 5 minutes in milliseconds
    const endTime = startTime + deliveryTimeMs;
    
    const updateProgress = () => {
      const currentTime = Date.now();
      
      // If delivery time has passed, set progress to 100%
      if (currentTime >= endTime) {
        setProgress(100);
        return;
      }
      
      // Calculate progress as percentage of time elapsed
      const elapsed = currentTime - startTime;
      const calculatedProgress = Math.min(Math.floor((elapsed / deliveryTimeMs) * 100), 100);
      setProgress(calculatedProgress);
    };
    
    // Update progress immediately
    updateProgress();
    
    // Set interval to update progress every second
    const interval = setInterval(updateProgress, 1000);
    
    return () => clearInterval(interval);
  }, [order.createdAt, order.status, progress]);

  useEffect(() => {
    // Define the callback function for the Google Maps API
    window.initMap = (orderId: string) => {
      if (!mapRef.current || orderId !== order.id) return;
      
      // Get address string from order
      const destinationAddress = `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.zipCode}, India`;
      
      // Create a geocoder to convert address to coordinates
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address: destinationAddress }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          const destinationLocation = results[0].geometry.location;
          
          // Create the map
          const map = new window.google.maps.Map(mapRef.current, {
            center: { 
              lat: (PHARMACY_LOCATION.lat + destinationLocation.lat()) / 2,
              lng: (PHARMACY_LOCATION.lng + destinationLocation.lng()) / 2
            },
            zoom: 10,
            mapTypeControl: false,
          });
          
          // Add markers for pharmacy (origin) and delivery address (destination)
          const pharmacyMarker = new window.google.maps.Marker({
            position: PHARMACY_LOCATION,
            map: map,
            title: PHARMACY_NAME,
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            },
          });
          
          const destinationMarker = new window.google.maps.Marker({
            position: destinationLocation,
            map: map,
            title: "Delivery Address",
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            },
          });
          
          // Add info windows
          const pharmacyInfo = new window.google.maps.InfoWindow({
            content: `<div><strong>${PHARMACY_NAME}</strong><br>Starting Point</div>`,
          });
          
          const destinationInfo = new window.google.maps.InfoWindow({
            content: `<div><strong>Delivery Address</strong><br>${destinationAddress}</div>`,
          });
          
          pharmacyMarker.addListener("click", () => {
            pharmacyInfo.open(map, pharmacyMarker);
          });
          
          destinationMarker.addListener("click", () => {
            destinationInfo.open(map, destinationMarker);
          });
          
          // Draw route between points
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#4285F4",
              strokeWeight: 5,
              strokeOpacity: 0.8,
            },
          });
          
          directionsService.route(
            {
              origin: PHARMACY_LOCATION,
              destination: destinationLocation,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result: any, status: any) => {
              if (status === "OK") {
                directionsRenderer.setDirections(result);
                
                // Calculate drone position along the route based on progress
                if (progress > 0 && progress < 100) {
                  const route = result.routes[0].overview_path;
                  const progressValue = progress / 100;
                  const index = Math.floor(progressValue * route.length);
                  
                  // Add drone marker
                  const dronePosition = route[Math.min(index, route.length - 1)];
                  
                  const droneMarker = new window.google.maps.Marker({
                    position: dronePosition,
                    map: map,
                    icon: {
                      url: "/drone-icon.png",
                      scaledSize: new window.google.maps.Size(32, 32),
                    },
                    title: "Delivery Drone",
                  });
                }
                
                // Fit the map bounds to include both markers
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(PHARMACY_LOCATION);
                bounds.extend(destinationLocation);
                map.fitBounds(bounds);
                
                // Add some padding
                const padding = { top: 50, right: 50, bottom: 50, left: 50 };
                map.fitBounds(bounds, padding);
              }
            }
          );
        }
      });
      
      setMapLoaded(true);
    };

    // Load Google Maps API if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDhDDZygiS6I_66ovUS12bmnlmhfBHTVbw&callback=initMap&v=weekly&orderId=${order.id}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    } else if (window.google.maps) {
      window.initMap(order.id);
    }
  }, [order.id, progress, order.address]);

  // Determine order status based on progress
  const orderStatus = progress >= 100 ? 'delivered' : progress > 0 ? 'in-transit' : 'processing';

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
            orderStatus === 'delivered'
              ? 'default'
              : orderStatus === 'in-transit'
              ? 'secondary'
              : 'outline'
          }
        >
          {orderStatus === 'delivered'
            ? 'Delivered'
            : orderStatus === 'in-transit'
            ? 'In Transit'
            : 'Processing'}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Delivery Progress</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="relative overflow-hidden rounded-lg" style={{ height: "250px" }}>
          <div ref={mapRef} className="w-full h-full"></div>
          
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {orderStatus === 'in-transit' && (
          <div className="text-center">
            <p className="text-sm">
              Estimated arrival in{' '}
              <span className="font-semibold">
                {remainingMinutes} {remainingMinutes === 1 ? 'minute' : 'minutes'}
              </span>
            </p>
          </div>
        )}

        {orderStatus === 'delivered' && (
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
