<template>
  <div id="app">
    <header>
      <div class="header-title">
        Kokuravi: the Bookmark Management System
      </div>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/about">About</router-link>
        <!-- 當用戶未登入時顯示登入鏈接 -->
        <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
        <!-- 僅當用戶已登入時顯示這些鏈接 -->
        <router-link v-if="isLoggedIn" to="/profile">Profile</router-link>
        <router-link v-if="isLoggedIn" to="/logout">Logout</router-link>
      </nav>
    </header>
    <main>
      <router-view></router-view> <!-- 顯示匹配的路由組件 -->
    </main>
    <footer>
      <p>&copy; 2024 Kokuraden Company. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

// 使用 Vuex 獲取登入狀態
const store = useStore();
const isLoggedIn = computed(() => store.getters.isAuthenticated);
</script>

<style scoped>
header {
  display: flex; /* 使用flexbox佈局 */
  align-items: center; /* 垂直居中對齊 */
  padding: 1rem;
  background-color: #f8f9fa;
}

nav {
  margin-left: auto; /* 將導航鏈接推到右側 */
}

nav a,
nav router-link {
  text-decoration: none;
  color: #007bff;
  margin-right: 1rem;
}

nav a:hover,
nav router-link:hover {
  text-decoration: underline;
}

main {
  padding: 1rem;
}

footer {
  padding: 1rem;
  text-align: center;
  background-color: #f8f9fa;
  position: relative;
  bottom: 0;
  width: 100%;
}

.logo {
  width: 100px; /* 根據需要調整寬度 */
  height: auto; /* 保持縱橫比 */
  margin-right: 1rem; /* 添加右邊距以分隔logo和導航 */
}

.header-title {
  font-size: 1.5rem; /* 大的字体 */
  font-weight: bold; /* 粗体 */
  color: #343a40; /* 深灰色 */
  text-align: center; /* 居中对齐 */
  margin-right: auto; /* 将标题推向左侧 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* 为文字添加阴影 */
}
</style>
