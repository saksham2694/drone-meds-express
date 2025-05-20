
import { useState } from "react";
import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface CartItemProps {
  item: CartItem;
}

export default function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => removeFromCart(item.id), 200);
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    updateQuantity(item.id, value);
  };

  return (
    <div className={`flex border-b py-4 ${isRemoving ? 'opacity-50' : ''} transition-opacity`}>
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
        <img
          src={item.imageUrl || 'https://placehold.co/100x100?text=Medicine'}
          alt={item.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between">
            <h3 className="text-base font-medium">{item.name}</h3>
            <p className="ml-4 text-base font-medium">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.category}</p>
        </div>
        
        <div className="flex flex-1 items-end justify-between mt-2">
          <div className="flex items-center border rounded">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => handleQuantityChange(item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-3">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            className="text-sm text-destructive hover:bg-destructive/10"
            onClick={handleRemove}
          >
            <Trash className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
