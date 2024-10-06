import { createStore } from 'vuex';
import Cookies from 'js-cookie';
import axios from 'axios';

const store = createStore({
  state() {
    return {
      user: null, // 存儲用戶信息
      isAuthenticated: false, // 記錄用戶是否已認證
      error: null, // 存儲錯誤信息
      categories: [],
    };
  },

  mutations: {
    setUser(state, user) {
      state.user = user;
      state.isAuthenticated = !!user; // 如果用戶存在，設定為已認證
    },
    logout(state) {
      state.user = null; // 清除用戶信息
      state.isAuthenticated = false; // 設定為未認證
    },
    setError(state, error) {
      state.error = error; // 設定錯誤信息
    },
    setCategories(state, categories) {
      state.categories = categories; // 存儲類別
    },
  },

  actions: {
    async login({ commit }, { username, password }) {
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '登入失敗');
        }

        const data = await response.json();
        commit('setUser', data.user); // 設定用戶信息
        
        // 將用戶信息存儲在 Cookie 中
        Cookies.set('user', JSON.stringify(data.user), { expires: 7 }); // 設定過期時間為 7 天
      } catch (error) {
        commit('setError', error.message); // 捕獲並設定錯誤信息
        throw error; // 拋出錯誤以便在組件中捕獲
      }
    },

    async logout({ commit }) {
      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/users/logout`, {
          method: 'POST',
        });
    
        if (!response.ok) {
          throw new Error('登出失敗');
        }
    
        commit('logout'); // 清除用戶狀態
        Cookies.remove('user'); // 清除 Cookie
      } catch (error) {
        console.error(error);
      }
    },

    async fetchCategories({ commit, state }) {
      if (!state.user) {
        console.error('用戶未登入，無法獲取類別');
        return;        
      }
      try {
        const userId = state.user._id; // 獲取用戶 ID
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/users/categories/all`, {
            params: { userId } // 將 userId 作為查詢參數傳遞
        });

        commit('setCategories', response.data); // 提交類別數據
      } catch (error) {
        console.error('獲取類別錯誤:', error);
      }
    },

    clearError({ commit }) {
      commit('setError', null); // 清除錯誤信息
    },
  },
  
  getters: {
    isAuthenticated: (state) => state.isAuthenticated, // 獲取認證狀態
    user: (state) => state.user, // 獲取用戶信息
    error: (state) => state.error, // 獲取錯誤信息
  },
});

export default store;
