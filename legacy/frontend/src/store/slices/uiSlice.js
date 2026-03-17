import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    cartOpen: false,
    searchOpen: false,
    modal: {
      isOpen: false,
      type: null, // 'login', 'register', 'product', 'confirm', etc.
      data: null,
    },
    notifications: [],
    loading: {
      global: false,
      components: {}, // { componentId: boolean }
    },
    theme: 'dark', // 'light' or 'dark'
    language: 'en',
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },
    setCartOpen: (state, action) => {
      state.cartOpen = action.payload;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload;
    },
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: action.payload.type || 'info', // 'success', 'error', 'warning', 'info'
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (state, action) => {
      const { componentId, isLoading } = action.payload;
      state.loading.components[componentId] = isLoading;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    initializeUI: (state) => {
      // Load saved preferences
      const savedTheme = localStorage.getItem('theme');
      const savedLanguage = localStorage.getItem('language');

      if (savedTheme) {
        state.theme = savedTheme;
      }

      if (savedLanguage) {
        state.language = savedLanguage;
      }
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleCart,
  setCartOpen,
  toggleSearch,
  setSearchOpen,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setComponentLoading,
  setTheme,
  setLanguage,
  initializeUI,
} = uiSlice.actions;

export default uiSlice.reducer;