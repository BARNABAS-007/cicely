import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import PopularDishes from './components/PopularDishes';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Reservation from './components/Reservation';
import Contact from './components/Contact';
import Footer from './components/Footer';
import OrderingMenu from './components/OrderingMenu';
import Cart from './components/Cart';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return session ? <>{children}</> : <Navigate to="/login" />;
}

function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <OrderingMenu />
      <About />
      <PopularDishes />
      <Gallery />
      <Reviews />
      <Reservation />
      <Contact />
      <Footer />
      <Cart />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
