
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { CartProvider } from './contexts/CartContext'
import OrderProvider from './contexts/OrderContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <CartProvider>
      <OrderProvider>
        <App />
      </OrderProvider>
    </CartProvider>
  </BrowserRouter>
);
