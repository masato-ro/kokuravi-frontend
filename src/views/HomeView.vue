<template>
  <div class="container">
    <!-- 檢查 API URL 是否設定 -->
    <div v-if="!isApiUrlSet" class="error-message">
      警告: API URL 未設定，請檢查環境變數 VITE_APP_API_URL。
    </div>

    <h1 v-if="user">使用者 "{{ user.username }}" 書籤</h1>
    <!-- 顯示所有類別，從左到右排列 -->
    <ul v-if="user" class="category-list">
      <li>
        <a href="#" @click.prevent="setSelectedCategory(null)">所有書籤</a>
      </li>
      <li v-for="category in sortedCategories" :key="category._id">
        <a href="#" @click.prevent="setSelectedCategory(category._id)">{{ category.name }}</a>
      </li>
    </ul>
    <h1 v-else>書籤</h1>
    
    <div v-if="user" class="category-container">
      <!-- 類別選擇器 -->
      <select v-model="selectedCategoryId" class="custom-select">
        <option value="">選擇類別</option>
        <option v-for="category in categories" :key="category._id" :value="category._id">
          {{ category.name }}
        </option>
      </select>
      
      <!-- 編輯書籤按鈕 -->
      <button @click="toggleBookmarkEditMode" 
              :class="{ 'disabled-button': isEditMode }">
              編輯書籤</button>
      
      <!-- 編輯書籤次按鈕 -->
      <div v-if="isBookmarkEditMode">
        <button class="edit-mode-button" @click="showAddBookmarkModal">添加書籤</button>
        <AddBookmarkModal v-if="isModalVisible" @close="closeModal" @add="handleAddBookmark" />

        <button class="edit-mode-button" @click="refresh">刷新書籤</button>

        <button class="edit-mode-button space-right" 
                v-if="showDeleteMode" 
                @click="deleteSelectedBookmarks" 
                :disabled="selectedBookmarks.length === 0 ">刪除所選書籤</button>
        <button class="edit-mode-button space-right" 
                v-else @click="showDeleteMode = !showDeleteMode">刪除書籤</button>
      </div>
      
      <!-- 編輯類別按鈕 -->
      <button @click="toggleEditMode"
              :class="{ 'disabled-button': isBookmarkEditMode }">
              編輯類別</button>
      
      <!-- 編輯類別次按鈕 -->
      <div v-if="isEditMode">
        <button class="edit-mode-button" @click="showCategoryModal">增加類別</button>
        <CategoryModal v-if="isCategoryModalVisible" @close="closeCategoryModal" @add="fetchCategories" />
  
        <button class="edit-mode-button" @click="showDeleteCategoryModal">刪除類別</button>
        <DeleteCategoryModal v-if="isDeleteCategoryModalVisible" @close="closeDeleteCategoryModal" />

        <button class="edit-mode-button" @click="showEditCategoryModal">編輯現有類別</button>
        <EditCategoryModal 
          v-if="isEditCategoryModalVisible" 
          :categories="categories" 
          @update="handleCategoryUpdate" 
          @close="closeEditCategoryModal" 
        />
      </div>

      <!-- 搜索框 -->
      <input type="text" placeholder="搜索書籤" v-model="searchKeyword" class="search-input" />
    </div>

    <table v-if="filteredBookmarks.length">
      <thead>
        <tr>
          <th v-if="showDeleteMode">選擇</th>
          <th class="click" @click="changeType('name')">網站名稱</th>
          <th class="click" @click="changeType('url')">URL</th>
          <th class="click" @click="changeType('description')">描述</th>
          <th class="click" @click="changeType('category')">類別</th>
          <th v-if="isBookmarkEditMode">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bookmark in filteredBookmarks" :key="bookmark._id">
          <td v-if="showDeleteMode">
            <input 
              type="checkbox" 
              v-model="selectedBookmarks" 
              :value="bookmark._id"
            />
          </td>
          <td>
            <img v-if="bookmark.icon" :src="bookmark.icon" alt="favicon" class="favicon" />
            <a :href="bookmark.url" target="_blank" rel="noopener noreferrer">
              {{ bookmark.name }}
            </a>
          </td>
          <td>{{ bookmark.url }}</td>
          <td>{{ bookmark.description }}</td>
          <td>{{ bookmark.categoryId.name }}</td>
          <td v-if="isBookmarkEditMode">
            <button @click="editBookmark(bookmark)">編輯</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="info-message">無書籤可顯示。</p>

    <!-- 控製編輯書籤Modal -->
    <BookmarkCard v-if="isEditModalVisible" 
                  :bookmark="selectedBookmark" 
                  :categories="categories" 
                  @close="closeEditModal" 
                  @update="refresh" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import AddBookmarkModal from '../components/AddBookmarkModal.vue';
import BookmarkCard from '../components/BookmarkCard.vue';
import CategoryModal from '../components/CategoryModal.vue';
import DeleteCategoryModal from '../components/DeleteCategoryModal.vue';
import EditCategoryModal from '../components/EditCategoryModal.vue'; // 引入編輯模態框
import axios from 'axios';

// 使用 Vuex store
const store = useStore();
const user = computed(() => store.state.user); // 從 Vuex 獲取當前用戶信息
const categories = computed(() => store.state.categories);

// 檢查 API URL 是否設定
const isApiUrlSet = computed(() => !!import.meta.env.VITE_APP_API_URL);

// 定義回響式數據
const bookmarks = ref([]); // 存儲用戶書籤的數組
const isModalVisible = ref(false); // 控製模態框的顯示與否
const selectedCategoryId = ref(''); // 用於存儲選擇的類別 ID
const showDeleteMode = ref(false); // 刪除模式
const selectedBookmarks = ref([]); // 用於存儲選擇的書籤 ID
const isEditModalVisible = ref(false); // 控製編輯模態框的顯示
const selectedBookmark = ref(null); // 存儲要編輯的書籤
const isEditMode = ref(false); // 用於控製編輯模式
const isCategoryModalVisible = ref(false); // 控製類別新增模態框的顯示
const isDeleteCategoryModalVisible = ref(false);
const isEditCategoryModalVisible = ref(false); // 控製編輯類別模態框的顯示
const isBookmarkEditMode = ref(false); // 用於控製編輯模式
const searchKeyword = ref(''); // 用於存儲搜索關鍵詞
const isAscending = ref(true); // 用於跟蹤排序的方嚮，初始為升序
const errorMessage = ref(''); // 添加錯誤消息變數

// 調用刷新函數
const refresh = async () => {
  try {
    await fetchBookmarks();
  } catch (error) {
    console.error('Error refreshing bookmarks:', error);
    errorMessage.value = error.message;
  }
};

// 在組件掛載時加載書籤
onMounted(async () => {
  if (user.value && user.value._id) {
    await fetchBookmarks(); // 加載書籤
    await store.dispatch('fetchCategories'); // 加載類別
  }
});

// 從服務器獲取書籤
const fetchBookmarks = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/users/bookmarks/all?userId=${user.value._id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch bookmarks');
    }
    bookmarks.value = await response.json(); // 將返回的書籤數據存儲在 bookmarks 中
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    errorMessage.value = error.message;
  }
}

// 刪除選擇的書籤
const deleteSelectedBookmarks = async () => {
  // 彈出確認對話框
  const userConfirmed = confirm("確定要刪除所選書籤嗎？");

  if (!userConfirmed) {
    // 如果用戶取消刪除操作，直接返回
    return;
  }

  try {
    // 開始刪除選中的書籤
    for (const bookmarkId of selectedBookmarks.value) {
      const response = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/users/bookmarks`, {
        params: { id: bookmarkId },
      });

      if (response.status !== 200) {
        throw new Error(`Failed to delete bookmark with id: ${bookmarkId}`);
      }
    }

    selectedBookmarks.value = []; // 清空選擇
    await fetchBookmarks(); // 刷新書籤列錶
  } catch (error) {
    console.error('Error deleting bookmarks:', error);
    errorMessage.value = error.message;
  }
}

// 顯示加入書籤模態框
const showAddBookmarkModal = () => {
  isModalVisible.value = true; // 顯示模態框
}

// 關閉加入書籤模態框
const closeModal = () => {
  isModalVisible.value = false; // 關閉模態框
}

// 顯示編輯書籤的模態框
const editBookmark = (bookmark) => {
  selectedBookmark.value = bookmark; // 設定當前選擇的書籤
  isEditModalVisible.value = true; // 顯示編輯模態框
};

// 關閉編輯書籤模態框
const closeEditModal = () => {
  isEditModalVisible.value = false; // 隱藏模態框
  selectedBookmark.value = null; // 重置選中的書籤
};

// 顯示類別新增模態框
const showCategoryModal = () => {
  isCategoryModalVisible.value = true; // 顯示類別模態框
};

// 關閉類別新增模態框
const closeCategoryModal = () => {
  isCategoryModalVisible.value = false; // 關閉類別模態框
};

// 顯示刪除類別的 Modal
const showDeleteCategoryModal = () => {
  isDeleteCategoryModalVisible.value = true;
};

// 關閉刪除類別的 Modal
const closeDeleteCategoryModal = () => {
  isDeleteCategoryModalVisible.value = false;
};

// 顯示編輯類別模態框
const showEditCategoryModal = () => {
  isEditCategoryModalVisible.value = true; // 顯示編輯模態框
};

// 關閉編輯類別模態框
const closeEditCategoryModal = () => {
  isEditCategoryModalVisible.value = false; // 隱藏編輯模態框
};

// 處理更新類別
const handleCategoryUpdate = async (updatedCategory) => {
  // 在這裡添加更新類別的邏輯，例如發送 API 請求來更新數據
  console.log('更新的類別:', updatedCategory);
  await store.dispatch('updateCategory', updatedCategory); // 假設存在此行為以更新類別
  await store.dispatch('fetchCategories'); // 更新後重新獲取類別
};

// 每當收到添加事件時，重新獲取書籤列錶
const handleAddBookmark = () => {
  fetchBookmarks(); // 刷新書籤列錶
};

const setSelectedCategory = (categoryId) => {
  selectedCategoryId.value = categoryId;
}

// 過濾書籤：根據選定的類別 ID 和搜尋關鍵字顯示書籤
const filteredBookmarks = computed(() => {
  let filtered = bookmarks.value;

  if (selectedCategoryId.value) {
    filtered = filtered.filter(bookmark => bookmark.categoryId._id === selectedCategoryId.value);
  }

  // 根據搜尋關鍵字篩選書籤
  if (searchKeyword.value) { // 使用 searchKeyword
    filtered = filtered.filter(bookmark => 
      bookmark.url.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      bookmark.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
  }

  return filtered;
});

// 切換書籤編輯模式
const toggleBookmarkEditMode = () => {
  isBookmarkEditMode.value = !isBookmarkEditMode.value;
  if (isBookmarkEditMode.value === false) {
    isBookmarkEditMode.value = false; // 取消書籤編輯模式
    showDeleteMode.value = false; // 取消刪除模式
  }
};

// 切換類別編輯模式
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const sortedCategories = computed(() => {
  return [...categories.value].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
});

const changeType = (type) => {
  bookmarks.value.sort((a, b) => {
    let comparison;
    if (type === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (type === 'url') {
      comparison = a.url.localeCompare(b.url);
    } else if (type === 'description') {
      comparison = a.description.localeCompare(b.description);
    } else if (type === 'category') {
      comparison = a.categoryId.name.localeCompare(b.categoryId.name);
    }
    return isAscending.value ? comparison : -comparison;
  });

  // 每次點選後切換排序方嚮
  isAscending.value = !isAscending.value;
};

</script>

<style scoped>
.category-container {
  display: flex;
  align-items: center; /* 垂直居中對齊 */
  justify-content: space-between; /* 在項目之間分配空間 */
  margin-bottom: 10px; /* 添加頂部間距 */
}

.category-container label {
  margin-right: 8px; /* Adjust space between label and dropdown */
}

.category-container select {
  margin-right: 8px; /* Adjust space between dropdown and button */
}

.custom-select {
  border: 4px ridge #007bff; /* 設置邊框為黑色，寬度為 2px */
  border-radius: 4px; /* 設置圓角 */
  padding: 5px; /* 增加內邊距 */
  outline: none; /* 移除默認選中樣式的外框 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加陰影效果 */
}

.space-right {
    margin-right: 10px; /* 調整為你需要的空間大小 */
}

.disabled-button {
    color: gray; /* 設定文字顔色為灰色 */
    pointer-events: none; /* 禁用點選事件 */
    opacity: 0.6; /* 設定透明度 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加陰影效果 */
}

.edit-mode-button {
  background-color: #28a745; /* 編輯模式下的顏色 */
  color: white; /* 文字顏色 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加陰影效果 */
}

.edit-mode-button:hover {
  background-color: #218838; /* 懸停時的顏色 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3); /* 懸停時更顯著的陰影 */
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-left: auto;
  max-width: 300px; /* 最大寬度，可以根據需要調整 */
  width: 100%; /* 寬度為100%以適應容器 */
}

.click {
  cursor: pointer;
  text-decoration: underline; /* 可選 */
}

.click:hover {
  color: #0056b3; /* 鏈接懸停顔色 */
}

.category-list {
  display: flex;
  flex-wrap: wrap; /* 當空間不足時自動換行 */
  padding-left: 0;
  list-style-type: none;
}

.category-list li {
  margin-right: 1.5rem; /* 每個類別之間的間距 */
  margin-bottom: 1rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加陰影效果 */
}

.category-list a {
  text-decoration: none;
  color: #007bff;
}

.category-list a:hover {
  text-decoration: underline;
}
</style>
