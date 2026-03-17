import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper functions
const loadCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

// Async thunks
export const syncCartWithServer = createAsyncThunk(
  'cart/syncWithServer',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { cart, auth } = getState();

      if (!auth.isAuthenticated) {
        return cart.items; // Return local cart if not authenticated
      }

      // This would sync with server cart if implemented
      // For now, just return local cart
      return cart.items;
    } catch (error) {
      return rejectWithValue('Failed to sync cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, product }, { rejectWithValue }) => {
    try {
      // If user is authenticated, sync with server
      const response = await axios.post('/api/cart/add', { productId, quantity });
      return response.data.data;
    } catch (error) {
      // Fallback to local storage if API fails
      console.warn('API call failed, using local storage');
      return { productId, quantity, product };
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/api/cart/update', { productId, quantity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue('Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/cart/remove/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue('Failed to remove item from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete('/api/cart/clear');
      return [];
    } catch (error) {
      return rejectWithValue('Failed to clear cart');
    }
  }
);

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartFromStorage(),
    isLoading: false,
    error: null,
    isSynced: false,
  },
  reducers: {
    addItem: (state, action) => {
      const { productId, quantity = 1, product } = action.payload;
      const existingItem = state.items.find(item => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          productId,
          quantity,
          product,
          addedAt: new Date().toISOString(),
        });
      }

      saveCartToStorage(state.items);
    },
    updateItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);

      if (item) {
        item.quantity = Math.max(0, quantity);
        if (item.quantity === 0) {
          state.items = state.items.filter(item => item.productId !== productId);
        }
        saveCartToStorage(state.items);
      }
    },
    removeItem: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.productId !== productId);
      saveCartToStorage(state.items);
    },
    clearAllItems: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sync with server
      .addCase(syncCartWithServer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(syncCartWithServer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.isSynced = true;
        state.error = null;
        saveCartToStorage(state.items);
      })
      .addCase(syncCartWithServer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isSynced = false;
      })

      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        // If it's server response, update accordingly
        // For now, handle local state updates in reducers
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = [];
        state.error = null;
        saveCartToStorage(state.items);
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);
export const selectCartItemCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartIsEmpty = (state) => state.cart.items.length === 0;

export const {
  addItem,
  updateItemQuantity,
  removeItem,
  clearAllItems,
  clearError
} = cartSlice.actions;

export default cartSlice.reducer;