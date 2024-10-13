<template>
    <div class="container">
        <div class="profile-container">
        <h1>修改用戶資料</h1>
        <form @submit.prevent="updateProfile">
            <div class="form-group">
            <label for="username">用戶名：</label>
            <input
                type="text"
                id="username"
                v-model="username"
                disabled
                class="disabled-input" 
                />
            </div>
            <div class="form-group">
            <label for="email">e-mail：</label>
            <input
                type="email"
                id="email"
                v-model="email"
                placeholder="請輸入新的信箱"
            />
            </div>
            <div class="form-group">
                <label for="password">新密碼：</label>
                <input
                type="password"
                id="password"
                v-model="password"
                placeholder="請輸入新密碼（可選）"
                />
            </div>
            <div class="form-group">
                <label for="confirmPassword">確認密碼：</label>
                <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                placeholder="請再次輸入新密碼"
                />
            </div>
            <button type="submit" :disabled="isLoading">{{ isLoading ? '更新中...' : '更新資料' }}</button>
        </form>
        <div class="error-message" v-if="errorMessage" >{{ errorMessage }}</div>
        <div class="success-message" v-if="successMessage" >{{ successMessage }}</div>
        </div>
      </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  import { useStore } from 'vuex';
  
  const store = useStore();
  const userId = store.state.user._id; // 假設已在 Vuex 中存儲用戶 ID
  const username = ref(store.state.user.username);
  const email = ref(store.state.user.email);
  const password = ref(''); // 不要預先填充密碼
  const confirmPassword = ref('');
  const isLoading = ref(false);
  const errorMessage = ref('');
  const successMessage = ref('');
  
  const updateProfile = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    
    // 檢查密碼是否一緻
    if (password.value !== confirmPassword.value) {
    errorMessage.value = '密碼不一緻，請重新輸入。';
    isLoading.value = false; // 重置加載狀態
    return;
    }
    
    try {
      // 初始化更新數據對象，隻包含非空的字段
      const updatedData = {};

      // 僅在新電子郵件存在時添加到更新數據
      if (email.value) {
        updatedData.email = email.value;
      }

      // 僅在密碼字段不為空時進行哈希處理並添加到更新數據
      if (password.value) {
        updatedData.password = password.value;
      }

      // 如果 `updatedData` 為空，錶示冇有需要更新的字段
      if (Object.keys(updatedData).length === 0) {
        throw new Error('冇有需要更新的字段');
      }

      // 發起 PUT 請求更新用戶信息
      const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/users`, {
        id: userId,
        ...updatedData, // 使用展開運算符隻傳遞需要更新的字段
      });

      if (response.status === 200) {
        successMessage.value = '用戶信息資料成功';
        // 更新 Vuex 中的用戶信息
        store.commit('setUser', response.data.updatedUser);
      }
    } catch (error) {
      errorMessage.value = error.response?.data?.error || '更新用戶資料失敗';
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  
  <style scoped>

  .profile-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  .disabled-input {
  background-color: #f0f0f0; /* 灰色背景 */
  color: #888; /* 灰色文字 */
  cursor: not-allowed; /* 改變滑鼠指針樣式 */
  }

  </style>
  