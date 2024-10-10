<template>
    <div class="modal">
      <div class="modal-content">
        <button class="close-button" @click="$emit('close')">×</button>
        <h2>新增類別</h2>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <input v-model="name" placeholder="類別名稱" required />
              <button type="submit">新增類別</button>
              <button type="button" @click="$emit('close')">取消</button>
          </div>
        </form>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

const emit = defineEmits(['add', 'close']);
const store = useStore();
const name = ref(''); // 用來存儲類別名稱的響應式變數
const errorMessage = ref(''); // 添加錯誤消息變數

// 提交表單函數
const submitForm = async () => {
    const categoryData = {
      userId: store.state.user._id, // 從 Vuex 獲取用戶 ID
      name: name.value, // 使用者輸入的類別名稱
    };

    try {
        // 發送 POST 請求以新增類別
        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/users/categories/add`, categoryData);
        if (response.status !== 201) {
          throw new Error('添加書籤失敗');
        }
        emit('add', { name: name.value }); // 發送 'add' 事件，帶上新增的類別名稱
        resetForm(); // 重置表單
        emit('close');
    } catch (error) {
      errorMessage.value = error.message;
    }
};

// 重置表單函數
const resetForm = () => {
    name.value = ''; // 清空類別名稱
    errorMessage.value = '';
};
</script>

<style scoped>

</style>
