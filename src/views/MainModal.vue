<template>
  <div v-if="props.isVisible" class="modal" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">×</button>
      <slot></slot> <!-- 插入內容 -->
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 定義 props
const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  }
});

// 定義 emit 方法
const emit = defineEmits(['close']);

// 關閉模態框的函數
const closeModal = () => {
  emit('close'); // 發出關閉事件
};
</script>

<style scoped>

.modal-content {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 8px;
  padding: 20px;
  position: relative; /* 设置为相对定位，以便绝对定位关闭按钮 */
  max-height: 80vh; /* 设置最大高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
}

.close-button {
  position: absolute; /* 绝对定位 */
  top: 0px;
  right: 0px;
  background-color: #808080; /* 按钮背景为红色 */
  border: none; /* 无边框 */
  border-radius: 50%; /* 圆形按钮 */
  width: 30px; /* 按钮宽度 */
  height: 30px; /* 按钮高度 */
  display: flex; /* 使用 flexbox 中心对齐内容 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  color: white; /* 字体颜色为白色 */
  font-size: 20px; /* 字体大小 */
  cursor: pointer; /* 鼠标指针变为手形 */
  transition: background-color 0.3s; /* 添加过渡效果 */
}

.close-button:hover {
  background-color: #ff6666; /* 悬停时的背景颜色变化 */
}
</style>
