import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Alert, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Context
import { CartProvider, CartContext } from './context/CartContext';

// API Services
import { productAPI, categoryAPI, authAPI } from './services/api';

// Components
import Navbar from './components/Navbar';
import AddQuantityModal from './components/AddQuantityModal';

// Pages
import HomePage from './pages/HomePage';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import LoginPage from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';

let alertTimeoutId = null;

function AppContent() {
  const { addToCart, refreshCart } = useContext(CartContext);
  
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = ['/login', '/forgot', '/reset', '/register'].includes(location.pathname);

  // Modal States
  const [showAddQtyModal, setShowAddQtyModal] = useState(false);
  const [productToAdd, setProductToAdd] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', variant: 'success' });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (token && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
    
    setLoading(false);
  }, []);

// Add this code to replace the useEffect for categories in App.js

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAll();
      
      // Transform backend data to frontend format
      const transformedCategories = data.map(cat => ({
        id: cat.id,
        name: cat.category_name,
        slug: cat.slug,
        imageUrl: cat.image_url || '/img/placeholder.png'
      }));
      
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      showAlert('Failed to load categories', 'danger');
    }
  };

  fetchCategories();
}, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {};
        
        if (selectedCategory) {
          // Backend expects category slug or ID
          const category = categories.find(c => c.id === selectedCategory);
          if (category) {
            params.category = category.slug || selectedCategory;
          }
        }
        
        if (searchTerm) {
          params.search = searchTerm;
        }

        const response = await productAPI.getAll(params);
        
        // Handle Laravel pagination response
        const productData = response.data || response;
        
        // Transform backend data to frontend format
        const transformedProducts = productData.map(p => ({
          id: p.id,
          name: p.product_name,
          price: parseFloat(p.price),
          stock: parseInt(p.stock),
          categoryId: p.category_id,
          imageUrl: p.image_url,
          description: p.description,
          discount: parseInt(p.discount) || 0,
          slug: p.slug,
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        showAlert('Failed to load products', 'danger');
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm, categories]);

  // Alert Handler
  const showAlert = (message, variant = 'success', duration = 5000) => {
    if (alertTimeoutId) clearTimeout(alertTimeoutId);
    setAlertInfo({ show: true, message, variant });
    alertTimeoutId = setTimeout(() => {
      setAlertInfo({ show: false, message: '', variant: 'success' });
    }, duration);
  };

  // Login Handler
  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    showAlert(`Welcome back, ${user.first_name || user.email}!`, 'success');
    
    // Refresh cart after login
    if (refreshCart) {
      refreshCart();
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      // Call backend logout
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local data regardless of API success
      setCurrentUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      showAlert('You have been logged out.', 'info');
      navigate('/');
    }
  };

  // Add to Cart Modal Handlers
  const handleShowAddQuantityModal = (product) => {
    if (!currentUser) {
      showAlert('Please log in to add items to your cart.', 'warning');
      navigate('/login');
      return false;
    }

    const productInState = products.find(p => p.id === product.id);
    if (!productInState || productInState.stock <= 0) {
      showAlert(`${product.name} is out of stock.`, 'danger');
      return false;
    }

    setProductToAdd(productInState);
    setShowAddQtyModal(true);
    return true;
  };

  const handleCloseAddQuantityModal = () => {
    setProductToAdd(null);
    setShowAddQtyModal(false);
  };

  const handleConfirmAddToCart = async (product, quantity) => {
    try {
      await addToCart(product, quantity);
      showAlert(`${quantity} x ${product.name} added to cart!`, 'success');
      handleCloseAddQuantityModal();
      
      // Refresh products to get updated stock
      const response = await productAPI.getAll();
      const productData = response.data || response;
      const transformedProducts = productData.map(p => ({
        id: p.id,
        name: p.product_name,
        price: parseFloat(p.price),
        stock: parseInt(p.stock),
        categoryId: p.category_id,
        imageUrl: p.image_url,
        description: p.description,
        discount: parseInt(p.discount) || 0,
        slug: p.slug,
      }));
      setProducts(transformedProducts);
      
    } catch (error) {
      showAlert(error.message || 'Failed to add to cart', 'danger');
    }
  };

  // Filter Handlers
  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {alertInfo.show && (
        <Alert
          variant={alertInfo.variant}
          onClose={() => setAlertInfo({ ...alertInfo, show: false })}
          dismissible
          className="app-alert"
        >
          {alertInfo.message}
        </Alert>
      )}

      {!isLoginPage && (
        <Navbar
          currentUser={currentUser}
          handleLogout={handleLogout}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleResetFilters={handleResetFilters}
          showAlert={showAlert}
        />
      )}

      <Container fluid className="main-content py-3">
        <Routes>
          <Route path="/" element={
            <HomePage
              products={products}
              categories={categories}
              onAddToCart={handleShowAddQuantityModal}
              currentPage={currentPage}
              productsPerPage={8}
              setCurrentPage={setCurrentPage}
            />
          } />
          
          <Route path="/products" element={
            <ProductList
              products={products}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onAddToCart={handleShowAddQuantityModal}
              currentPage={currentPage}
              productsPerPage={8}
              setCurrentPage={setCurrentPage}
            />
          } />
          
          <Route path="/product/:productId" element={
            <ProductDetails 
              products={products} 
              onAddToCart={handleShowAddQuantityModal} 
            />
          } />
          
          <Route path="/cart" element={<Cart showAlert={showAlert} />} />
          
          <Route path="/checkout" element={
            <Checkout showAlert={showAlert} handleResetFilters={handleResetFilters} />
          } />
          
          <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
        </Routes>
      </Container>

      <AddQuantityModal
        show={showAddQtyModal}
        handleClose={handleCloseAddQuantityModal}
        product={productToAdd}
        handleAdd={handleConfirmAddToCart}
      />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;