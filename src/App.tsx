
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Tracking from "./pages/Tracking";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import Admin from "./pages/Admin";
import { useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Add console log for debugging
console.log("App.tsx loaded, Admin component:", Admin);

function App() {
  // Add debugging to check if routes are properly set up
  useEffect(() => {
    console.log("Routes initialized");
  }, []);
  
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/tracking/:orderId" element={<Tracking />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
