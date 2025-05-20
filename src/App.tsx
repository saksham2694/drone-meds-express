
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Tracking from "./pages/Tracking";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import Admin from "./pages/Admin";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/tracking/:orderId" element={<Tracking />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
