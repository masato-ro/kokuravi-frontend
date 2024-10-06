<template>
  <div class="container">
    <div class="login-container">
      <h1>用戶登入</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用戶名：</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="請輸入用戶名"
          />
        </div>
        <div class="form-group">
          <label for="password">密碼：</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="請輸入密碼"
          />
        </div>
        <div class="form-group">
          <label for="captcha">驗證碼</label>
          <input type="text" v-model="captchaInput" required placeholder="請輸入驗證碼" />
          <img :src="captchaUrl" alt="驗證碼" />
          <button type="button" @click="refreshCaptcha">刷新驗證碼</button>
          <button type="submit" :disabled="isLoading">{{ isLoading ? '登入中...' : '登入' }}</button>
        </div>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const isLoading = ref(false);
const captchaInput = ref(''); // 用戶輸入的驗證碼
const captchaText = ref('');  // 後端提供的驗證碼文本
const captchaUrl = ref(`${import.meta.env.VITE_APP_API_URL}/api/captcha/image`); // 驗證碼圖片 URL
const errorMessage = ref('');

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

// 當組件加載時，獲取初始的驗證碼
onMounted(() => {
  refreshCaptcha();
});

const handleLogin = async () => {
  store.dispatch('clearError'); // 清除之前的錯誤信息
  isLoading.value = true; // 開始加載

  try {
    // 先確保驗證碼已被獲取
    await refreshCaptcha();
    // 驗證用戶輸入的驗證碼是否正確
    if (captchaInput.value !== captchaText.value) {
    throw new Error('驗證碼錯誤');
  }
    // 如果驗證碼正確，發送登入請求
    await store.dispatch('login', { username: username.value, password: password.value });
    username.value = ''; // 清空用戶名
    password.value = ''; // 清空密碼
    captchaInput.value = ''; // 清空驗證碼輸入框
    refreshCaptcha(); // 登入成功後刷新驗證碼
    // 登入成功後重定嚮
    await router.push('/'); // 確保 router 是從上下文中獲取的
  } catch (error) {
    console.error('登入錯誤:', error);
    errorMessage.value = error.response?.data?.error || '登入失敗，請檢查用戶名和密碼。'; // 顯示後端返回的錯誤信息
  } finally {
    isLoading.value = false; // 結束加載
    refreshCaptcha(); // 無論是否成功，重新刷新驗證碼
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.error {
  color: red;
  text-align: center;
  margin-top: 1rem;
}
</style>
