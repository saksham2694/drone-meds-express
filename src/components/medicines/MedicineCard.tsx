
import { useState } from "react";
import { Medicine } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { Plus, Check } from "lucide-react";

interface MedicineCardProps {
  medicine: Medicine;
}

export default function MedicineCard({ medicine }: MedicineCardProps) {
  const { addToCart, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const isInCart = items.some(item => item.id === medicine.id);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(medicine);
    
    // Reset the animation after a short delay
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/300x200?text=Medicine';
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden bg-secondary">
        <img
          src={medicine.imageUrl}
          alt={medicine.name}
          className="h-full w-full object-cover object-center"
          onError={handleImageError}
        />
        <Badge className="absolute top-2 right-2 bg-primary">
          ${medicine.price.toFixed(2)}
        </Badge>
      </div>
      <CardContent className="pt-4 flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{medicine.name}</h3>
            <p className="text-xs text-muted-foreground">{medicine.category}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
          {medicine.description}
        </p>
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Button
          onClick={handleAddToCart}
          variant={isInCart ? "secondary" : "default"}
          className="w-full transition-all"
          disabled={isAdding}
        >
          {isAdding ? (
            <span className="flex items-center">Adding...</span>
          ) : isInCart ? (
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" /> Added
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add to Cart
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
