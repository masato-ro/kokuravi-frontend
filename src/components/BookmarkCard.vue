<template>
  <div class="modal">
    <div class="modal-content">
      <span class="close" @click="$emit('close')">&times;</span>
      <h2>編輯書籤</h2>
      <form @submit.prevent="updateBookmark">
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
            <label for="category">選擇類別：</label>
            <a>目前類別：{{ categoryId.name }}</a>
            <select v-model="categoryId" required>
              <option value="" disabled>請選擇一個類別</option>
              <option v-for="category in categories" :key="category._id" :value="category._id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="button-group" style="text-align: center;">
            <button type="submit">更新書籤</button>
            <button type="button" @click="$emit('close')">取消</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, toRefs } from 'vue';
import axios from 'axios';

// 使用 defineProps 來接收傳遞的屬性
const props = defineProps(['bookmark', 'categories']);
const { bookmark, categories } = toRefs(props);

// 定義觸發的事件
const emit = defineEmits(['update', 'close']);

// 使用 ref 創建回響式數據
const name = ref(bookmark.value.name);
const url = ref(bookmark.value.url);
const icon = ref(bookmark.value.icon);
const description = ref(bookmark.value.description);
const categoryId = ref(bookmark.value.categoryId); // 添加類別ID

// watch 監聽 bookmark 的變化，更新相應的字段
watch(bookmark, (newBookmark) => {
  name.value = newBookmark.name;
  url.value = newBookmark.url;
  icon.value = newBookmark.icon;
  description.value = newBookmark.description;
  categoryId.value = newBookmark.categoryId;
});

// 更新書籤的方法
const updateBookmark = async () => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}}/api/users/bookmarks`, {
      id: bookmark.value._id, // 傳遞書籤ID
      categoryId: categoryId.value, // 更新類別
      url: url.value,
      name: name.value,
      icon: icon.value,
      description: description.value,
    });

    if (response.status !== 200) {
      throw new Error('更新失敗');
    }

    // 觸發父組件的更新事件
    emit('update'); 
    emit('close');  // 關閉模態框
  } catch (error) {
    console.error('更新書籤錯誤:', error);
  }
};
</script>

<style scoped>

</style>