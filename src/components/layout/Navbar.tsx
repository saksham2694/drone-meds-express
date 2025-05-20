
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import LoginModal from "@/components/auth/LoginModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { checkIsAdmin } from "@/services/medicineService";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isMobile = useIsMobile();
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await checkIsAdmin(user.id);
        setIsAdmin(adminStatus);
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <header className="sticky top-0 w-full border-b bg-background/95 backdrop-blur z-30">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            {isDarkMode ? (
              <img
                src="/lovable-uploads/05d16cab-f106-477e-99e9-c970e59960ad.png" 
                alt="MediDrone Logo"
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/32x32?text=MD';
                }}
              />
            ) : (
              <img
                src="/lovable-uploads/a25f0758-913a-43c9-bdb5-2b9cf0968628.png" 
                alt="MediDrone Logo"
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/32x32?text=MD';
                }}
              />
            )}
            <span className="text-xl font-semibold text-primary">MediDrone</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className="font-medium transition-colors hover:text-primary">
            Home
          </Link>
          {user && (
            <Link to="/orders" className="font-medium transition-colors hover:text-primary">
              My Orders
            </Link>
          )}
          <ThemeToggle />
        </nav>

        {/* Mobile & Desktop Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col gap-4 px-2 py-6">
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 py-2 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  {user && (
                    <Link 
                      to="/orders" 
                      className="flex items-center gap-2 py-2 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                  )}
                  <div className="py-2">
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user.photoURL} 
                  alt={user.name} 
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                  }}
                />
                <AvatarFallback>
                  {user.name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => signOut()}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </Button>
          )}

          {isAdmin && (
            <Link to="/admin" className="hidden md:block">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          )}
        </div>
      </div>

      {showLoginModal && (
        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      )}
    </header>
  );
}
