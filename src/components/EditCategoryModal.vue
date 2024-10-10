<template>
    <div class="modal">
      <div class="modal-content">
        <button class="close-button" @click="$emit('close')">×</button>
        <h2>編輯類別</h2>
        <form @submit.prevent="saveCategory">
          <div class="form-group">
            <!-- 選擇類別下拉框 -->
            <select v-model="selectedCategoryId" @change="updateSelectedCategory" required>
              <option value="">選擇類別</option>
              <option v-for="category in categories" :key="category._id" :value="category._id" >
                {{ category.name }}
              </option>
            </select>
            
            <!-- 編輯類別名稱的輸入框 -->
            <input
              type="text"
              v-model="editedCategoryName"
              placeholder="輸入新的類別名稱"
              :disabled="!selectedCategoryId"
              required
            />
          </div>
          <div class="button-group" style="text-align: center;">
            <!-- 保存按鈕 -->
            <button @click="saveCategory">保存</button>
            <button type="button" @click="$emit('close')">取消</button> 
          </div>
        </form>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import axios from 'axios'; // 引入 axios
  
  // Props
  const props = defineProps({
    categories: {
      type: Array,
      required: true,
    },
  });

  // 定義觸發的事件
  const emit = defineEmits(['update', 'close']);
  
  // Reactive Variables
  const selectedCategoryId = ref(''); // 用於存儲選擇的類別 ID
  const editedCategoryName = ref('');  // 編輯的類別名稱
  const parentId = ref(null);           // 可以用來存儲 parentId
  const errorMessage = ref(''); // 添加錯誤消息變數
  
  // Watch for category selection changes
  watch(selectedCategoryId, (newVal) => {
    const selectedCategory = props.categories.find(cat => cat._id === newVal);
    editedCategoryName.value = selectedCategory ? selectedCategory.name : '';
    parentId.value = selectedCategory ? selectedCategory.parentId : null; // 更新 parentId
  });
  
  // Save Category Function
  const saveCategory = async () => {
    if (!editedCategoryName.value) {
      return;
    }
  
    const updatedCategory = {
      _id: selectedCategoryId.value,
      name: editedCategoryName.value,
      parentId: parentId.value // 如果需要的話，傳遞 parentId
    };
  
    try {
      const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/users/categories`, {
        id: updatedCategory._id,
        name: updatedCategory.name,
        parentId: updatedCategory.parentId
      });
  
      // 處理成功響應（根據您的需求）
      if (response.data) {
        emit('update', updatedCategory); // 通知父組件更新類別
        emit('close'); // 關閉模態框
      }
    } catch (error) {
      errorMessage.value = error.message;
    }
  };
  </script>
  
  <style scoped>

  </style>
  