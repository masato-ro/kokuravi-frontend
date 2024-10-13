<template>
  <div id="app" :class="theme">
    <header>
      <div class="header-title">
        Kokuravi<span style="font-size: 0.8em;"> the Bookmark Management System</span>
      </div>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="#" @click="showAboutModal">About</router-link>
        <!-- 當用戶未登入時顯示登入鏈接 -->
        <router-link v-if="!isLoggedIn" to="#" @click="showAddUserModal">Create User</router-link>
        <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
        <!-- 僅當用戶已登入時顯示這些鏈接 -->
        <router-link v-if="isLoggedIn" to="#" @click="showProfileModal">Profile</router-link>
        <router-link v-if="isLoggedIn" to="/logout">Logout</router-link>
        <router-link to="#" @click="toggleTheme">{{ theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}</router-link>
      </nav>
    </header>
    <main>
      <MainModal :isVisible="isModalVisible" @close="closeModal">
        <component :is="currentModal" />
      </MainModal>
      <router-view></router-view> <!-- 顯示匹配的路由組件 -->
    </main>
    <footer>
      <span>&copy; 2024 Kokuraden Company. All rights reserved.</span>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { ref } from 'vue';
import MainModal from '@/views/MainModal.vue';
import AboutView from '@/views/AboutView.vue';
import ProfileView from '@/views/ProfileView.vue';
import AddUserView from './views/AddUserView.vue';

const isModalVisible = ref(false);
const currentModal = ref(null);
const theme = ref('light'); // 初始為日間模式

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};

// 顯示創建使用者模態框
const showAddUserModal = () => {
  currentModal.value = AddUserView;
  isModalVisible.value = true;
}

// 顯示關於模態框
const showAboutModal = () => {
  currentModal.value = AboutView;
  isModalVisible.value = true;
};

// 顯示個人資料模態框
const showProfileModal = () => {
  currentModal.value = ProfileView;
  isModalVisible.value = true;
};

// 關閉模態框
const closeModal = () => {
  isModalVisible.value = false;
  currentModal.value = null; // 重置當前模態框組件
};

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
  font-size: 1rem;
  padding: 1rem;
  text-align: center;
  background-color: #f8f9fa;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* 為文字添加陰影 */
}

.logo {
  width: 100px; /* 根據需要調整寬度 */
  height: auto; /* 保持縱橫比 */
  margin-right: 1rem; /* 添加右邊距以分隔logo和導航 */
}

.header-title {
  font-size: 1.5rem; /* 大的字體 */
  font-weight: bold; /* 粗體 */
  color: #343a40; /* 深灰色 */
  text-align: center; /* 居中對齊 */
  margin-right: auto; /* 將標題推嚮左側 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* 為文字添加陰影 */
}
</style>