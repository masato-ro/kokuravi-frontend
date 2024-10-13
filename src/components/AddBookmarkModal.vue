<template>
  <div class="modal">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">×</button>
      <h2>添加書籤</h2>
      <form @submit.prevent="debouncedHandleSubmit">
        <div class="form-group">
          <div>
            <label for="name">書籤名稱：</label>
            <input type="text" v-model="name" required />
          </div>
          <div>
            <label for="url">書籤 URL：</label>
            <input type="url" v-model="url" required />
          </div>
          <div>
            <label for="icon">圖示 URL：</label>
            <input type="url" v-model="icon" placeholder="如為空，嘗試抓取網站預設圖示"/>
          </div>
          <div>
            <label for="description">描述：</label>
            <textarea v-model="description" required></textarea>
          </div>
          <div>
            <label for="categoryId">選擇類別：</label>
            <select v-model="categoryId" required>
              <option value="" disabled>請選擇一個類別</option>
              <option v-for="category in categories" :key="category._id" :value="category._id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="button-group" style="text-align: center;">
            <button type="submit" :disabled="isSubmitting">提交書籤</button>
            <button type="button" @click="$emit('close')">取消</button>
          </div>
        </div>  
      </form>
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, onMounted } from 'vue';
import { useStore } from 'vuex';
import { debounce } from 'lodash';
import axios from 'axios';

const store = useStore();
const emit = defineEmits(['add', 'close']);
const name = ref('');
const url = ref('');
const icon = ref('');
const description = ref('');
const categoryId = ref('');
const errorMessage = ref('');

// 計算屬性獲取類別和用戶信息
const categories = computed(() => store.state.categories);
const user = computed(() => store.state.user);

// Fetch categories on mount
const fetchCategories = async () => {
  await store.dispatch('fetchCategories');
};

onMounted(fetchCategories);

// 使用防抖處理
const debouncedHandleSubmit = debounce(async () => {
  await handleSubmit();
}, 300); // 設定防抖時間

const handleSubmit = async () => {
  const userId = user.value ? user.value._id : '';
  if (!userId) {
    errorMessage.value = '用戶未登入，無法添加書籤';
    return;
  }

  const faviconUrl = icon.value.trim() || `${new URL(url.value).origin}/favicon.ico`;

  try {
    const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/users/bookmarks/add`, {
      userId,
      categoryId: categoryId.value,
      url: url.value,
      name: name.value,
      icon: faviconUrl,
      description: description.value,
    });

    // 檢查回響狀態碼
    if (response.status === 201) {
      emit('add', { 
        name: name.value, 
        url: url.value, 
        icon: faviconUrl, 
        description: description.value, 
        categoryId: categoryId.value 
      });
      resetForm();
      emit('close');
    } else {
      throw new Error('添加書籤失敗');
    }
  } catch (error) {
    errorMessage.value = error.response ? error.response.data.error || '添加書籤失敗' : '添加書籤失敗';
  }

};

const resetForm = () => {
  name.value = '';
  url.value = '';
  icon.value = '';
  description.value = '';
  categoryId.value = '';
  errorMessage.value = '';
};
</script>

<style scoped>

</style>
