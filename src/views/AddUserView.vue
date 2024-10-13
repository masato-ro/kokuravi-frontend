<template>
    <div class="add-user-container">
      <h1>新增用戶</h1>
      <form @submit.prevent="addUser">
        <div class="form-group">
          <label for="username">用戶名：</label>
          <input type="text" id="username" v-model="username" required placeholder="請輸入用戶名" />
          <label for="password">密碼：</label>
          <input type="password" id="password" v-model="password" required placeholder="請輸入密碼" />
          <label for="email">電子郵件：</label>
          <input type="email" id="email" v-model="email" required placeholder="請輸入電子郵件" />
          <label for="captcha">驗證碼：</label>
          <input type="text" v-model="captchaInput" required placeholder="請輸入驗證碼" />
          <img :src="captchaUrl" alt="驗證碼" />
          <button type="button" @click="refreshCaptcha">刷新驗證碼</button>
          <button type="submit" :disabled="isLoading">{{ isLoading ? '提交中...' : '新增用戶' }}</button>
        </div>
      </form>
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      <div class="success-message" v-if="successMessage">{{ successMessage }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  
  const username = ref('');
  const password = ref('');
  const email = ref('');
  const isLoading = ref(false);
  const captchaInput = ref(''); // 用戶輸入的驗證碼
  const captchaText = ref('');  // 後端提供的驗證碼文本
  const captchaUrl = ref(`${import.meta.env.VITE_APP_API_URL}/api/captcha/image`); // 驗證碼圖片 URL
  const errorMessage = ref('');
  const successMessage = ref('');
  
  // 刷新驗證碼函數
  const refreshCaptcha = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/captcha/text`); // 獲取驗證碼文本
      captchaText.value = response.data.text; // 保存後端提供的驗證碼文本
      // 如果 URL 需要變更
      captchaUrl.value = `${import.meta.env.VITE_APP_API_URL}/api/captcha/image?${Date.now()}`;
    } catch (error) {
      console.error('Error fetching captcha:', error);
      errorMessage.value = '無法刷新驗證碼，請稍後再試。';
    }
  };

  const addUser = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    try {
      // 先確保驗證碼已被獲取
      await refreshCaptcha();
      
      // 驗證用戶輸入的驗證碼是否正確
      if (captchaInput.value !== captchaText.value) {
        throw new Error('驗證碼錯誤');
    }
      
    const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/users`, {
        username: username.value,
        password: password.value,
        email: email.value,
      });

      if (response.status === 201) {
        successMessage.value = '用戶創建成功！';
        username.value = '';
        password.value = '';
        email.value = '';
      }
    } catch (error) {
        if (error.response && error.response.status === 400) {
          errorMessage.value = error.response.data.error || '創建用戶失敗';
      } else {
        errorMessage.value = '創建用戶失敗';
      }
    } finally {
      isLoading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .add-user-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  </style>
  