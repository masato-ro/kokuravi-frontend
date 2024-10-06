<template>
  <div class="modal">
    <div class="modal-content">
      <span class="close" @click="$emit('close')">&times;</span>
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
            <input type="url" v-model="icon" required />
          </div>
          <div>
            <label for="description">描述：</label>
            <textarea v-model="description"></textarea>
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
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, onMounted } from 'vue';
import { useStore } from 'vuex';
import { debounce } from 'lodash';

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

  try {
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/users/bookmarks/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        categoryId: categoryId.value,
        url: url.value,
        name: name.value,
        icon: icon.value,
        description: description.value,
      }),
    });
    if (!response.ok) {
      throw new Error('添加書籤失敗');
    }
    emit('add', { name: name.value, url: url.value, icon: icon.value, description: description.value, categoryId: categoryId.value });
    resetForm();
    emit('close');
  } catch (error) {
    console.error('添加書籤錯誤:', error);
    errorMessage.value = error.message;
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
