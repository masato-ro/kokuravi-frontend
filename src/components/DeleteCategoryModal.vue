<template>
    <div class="modal">
      <div class="modal-content">
        <span class="close" @click="$emit('close')">&times;</span>
        <h2>刪除類別</h2>
        <form @submit.prevent="deleteCategory">
          <div class="form-group">
            <label for="category">選擇類別：</label>
            <select v-model="selectedCategoryId" required>
              <option value="" disabled>請選擇一個類別</option>
              <option v-for="category in categories" :key="category._id" :value="category._id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="button-group" style="text-align: center;">
            <button type="submit">刪除類別</button>
            <button type="button" @click="$emit('close')">取消</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useStore } from 'vuex';
  import axios from 'axios';
  
  const emit = defineEmits(['close']);
  const store = useStore();
  const categories = ref([]);
  const selectedCategoryId = ref('');
  
  // 獲取類別列表
  const fetchCategories = async () => {
    await store.dispatch('fetchCategories');
    categories.value = store.state.categories; // 假設 Vuex store 中有 categories 屬性
  };
  
  // 刪除類別的方法
  const deleteCategory = async () => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/users/categories`, {
        params: { id: selectedCategoryId.value },
      });
  
      if (response.status !== 200) {
        throw new Error('刪除失敗');
      }
  
      emit('close'); // 關閉模態框
      fetchCategories(); // 刷新類別列表
    } catch (error) {
      console.error('刪除類別錯誤:', error);
    }
  };
  
  // 在組件掛載時獲取類別
  onMounted(fetchCategories);
  </script>
  
  <style scoped>
  /* 在這裡添加你的樣式 */
  </style>