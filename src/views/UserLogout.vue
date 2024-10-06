<template>
    <div class="logout-message">
      <h2>登出成功</h2>
      <p>正在為您返回登入頁面...</p>
    </div>
  </template>
  
  <script>
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useStore } from 'vuex';
  
  export default {
    setup() {
      const router = useRouter();
      const store = useStore();
  
      onMounted(async () => {
        await store.dispatch('logout'); // 調用登出 action
        setTimeout(() => {
          router.push('/login'); // 3秒後重定嚮到登入頁面
        }, 3000);
      });
  
      return {};
    },
  };
  </script>
  
  <style scoped>
  .logout-message {
    text-align: center;
    margin-top: 50px;
  }
  </style>