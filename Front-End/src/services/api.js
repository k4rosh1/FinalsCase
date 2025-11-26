// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8095/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to create headers
const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  
  return data;
};

// ==========================================
// AUTH ENDPOINTS
// ==========================================

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Login (sends OTP)
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Verify OTP and get token
  verifyOTP: async (email, code) => {
    const response = await fetch(`${API_BASE_URL}/otp/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, code }),
    });
    return handleResponse(response);
  },

  // Resend OTP
  resendOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/resend-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  // Reset Password
  resetPassword: async (email, code, password) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, code, password }),
    });
    return handleResponse(response);
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    return handleResponse(response);
  },
};

// ==========================================
// PRODUCT ENDPOINTS
// ==========================================

export const productAPI = {
  // Get all products with optional filters
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/products${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get single product by ID or slug
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Create product (Admin only)
  create: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  // Update product (Admin only)
  update: async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  // Delete product (Admin only)
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(response);
  },
};

// ==========================================
// CATEGORY ENDPOINTS
// ==========================================

export const categoryAPI = {
  // Get all categories
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get single category
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Create category (Admin only)
  create: async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },

  // Update category (Admin only)
  update: async (id, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },

  // Delete category (Admin only)
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(response);
  },
};

// ==========================================
// CART ENDPOINTS
// ==========================================

export const cartAPI = {
  // Get user's cart
  get: async () => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    return handleResponse(response);
  },

  // Add item to cart
  addItem: async (productId, quantity) => {
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    return handleResponse(response);
  },

  // Update cart item quantity
  updateItem: async (itemId, quantity) => {
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ quantity }),
    });
    return handleResponse(response);
  },

  // Remove item from cart
  removeItem: async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(response);
  },

  // Clear entire cart
  clear: async () => {
    const response = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(response);
  },
};

// ==========================================
// ORDER ENDPOINTS
// ==========================================

export const orderAPI = {
  // Get user's orders
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    return handleResponse(response);
  },

  // Get single order
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    return handleResponse(response);
  },

  // Place order (checkout)
  create: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  // Cancel order
  cancel: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: 'PUT',
      headers: getHeaders(true),
    });
    return handleResponse(response);
  },

  // Update order status (Admin only)
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },
};

// ==========================================
// USER ENDPOINTS
// ==========================================

export const userAPI = {
  // Get current user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    return handleResponse(response);
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Change password
  changePassword: async (currentPassword, newPassword, otp) => {
    const response = await fetch(`${API_BASE_URL}/user/password`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword,
        otp,
      }),
    });
    return handleResponse(response);
  },

  // Request OTP for profile changes
  requestOTP: async () => {
    const response = await fetch(`${API_BASE_URL}/user/request-otp`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    return handleResponse(response);
  },
};

export default {
  auth: authAPI,
  products: productAPI,
  categories: categoryAPI,
  cart: cartAPI,
  orders: orderAPI,
  user: userAPI,
};