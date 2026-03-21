import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';

const Login = lazy(() => import('./pages/Login'));
const Setup = lazy(() => import('./pages/Setup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Checkout = lazy(() => import('./pages/Checkout'));
import Header from './components/Header';
import ModernMenu from './components/ModernMenu';
import About from './components/About';
import PopularDishes from './components/PopularDishes';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Reservation from './components/Reservation';
import Contact from './components/Contact';
import Footer from './components/Footer';
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
    <div className="min-h-screen bg-navy-950">
      <Header />
      <ModernMenu />
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
          <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-orange-500 font-bold">Loading Cicely...</div>}>
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
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
