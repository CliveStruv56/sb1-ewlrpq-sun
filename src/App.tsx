import React from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import { CategoryGrid } from './components/CategoryGrid';
import { Cart } from './components/Cart';
import { CartSummary } from './components/CartSummary';
import { TimeSelectionPage } from './components/TimeSelectionPage';
import { Checkout } from './components/Checkout';
import { OrderConfirmation } from './components/OrderConfirmation';
import { UserMenu } from './components/UserMenu';
import { AdminSettings } from './components/AdminSettings';
import { useProducts } from './hooks/useProducts';
import { useAuthStore } from './store/authStore';
import { Category } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.email === 'admin@example.com';

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function CategoryPage() {
  const { category = 'Coffees' } = useParams<{ category?: string }>();
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error loading products. Please try again later.</div>
      </div>
    );
  }

  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  return <CategoryGrid products={products} category={formattedCategory as Category} />;
}

function App() {
  const categories: Category[] = ['Coffees', 'Teas', 'Cakes', 'Hot Chocolate'];
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-3xl font-bold text-gray-900">
                Some Good Cuppa
              </Link>
              <div className="flex items-center space-x-6">
                <UserMenu />
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2"
                >
                  <span className="sr-only">Open menu</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    />
                  </svg>
                </button>
              </div>
            </div>
            <nav className={`mt-4 ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
              <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/category/${cat.toLowerCase()}`}
                    className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 mt-32">
          <Routes>
            <Route path="/" element={<CategoryPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/cart" element={<CartSummary />} />
            <Route path="/collection-time" element={<TimeSelectionPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmation" element={<OrderConfirmation />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>

        <Cart />
      </div>
    </BrowserRouter>
  );
}

export default App;