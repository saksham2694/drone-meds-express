
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { CartProvider } from './contexts/CartContext'
import OrderProvider from './contexts/OrderContext'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <App />
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);
