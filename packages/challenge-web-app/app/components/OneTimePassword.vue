<script setup lang="ts">
import { Protect } from '@icon-park/vue-next';

const props = defineProps<{
   length?: number;
   error?: boolean;
}>();

const emit = defineEmits<{
   complete: [code: string];
}>();

const length = computed(() => props.length || 6);
const code = defineModel<string>('value', { default: '' });

// 创建输入框引用数组
const inputRefs = ref<HTMLInputElement[]>([]);

// 将代码转换为数组形式
const codeArray = computed({
   get: () => {
      const arr = code.value.split('');
      return Array.from({ length: length.value }, (_, i) => arr[i] || '');
   },
   set: (newArray: string[]) => {
      code.value = newArray.join('');
   },
});

// 处理输入
const handleInput = (index: number, event: Event) => {
   const input = event.target as HTMLInputElement;
   const value = input.value;

   // 只允许数字
   const numericValue = value.replace(/[^0-9]/g, '');

   if (numericValue) {
      const newArray = [...codeArray.value];
      newArray[index] = numericValue[numericValue.length - 1]!; // 只取最后一个数字
      codeArray.value = newArray;

      // 自动跳到下一个输入框
      if (index < length.value - 1) {
         inputRefs.value[index + 1]?.focus();
      }

      // 检查是否完成
      if (
         codeArray.value.every((digit) => digit !== '') &&
         index === length.value - 1
      ) {
         emit('complete', code.value);
      }
   } else {
      // 如果清空,更新对应位置
      const newArray = [...codeArray.value];
      newArray[index] = '';
      codeArray.value = newArray;
   }
};

// 处理键盘事件
const handleKeydown = (index: number, event: KeyboardEvent) => {
   if (event.key === 'Backspace') {
      event.preventDefault();
      const newArray = [...codeArray.value];

      if (codeArray.value[index]) {
         // 如果当前有值,清空
         newArray[index] = '';
         codeArray.value = newArray;
      } else if (index > 0) {
         // 如果当前无值,清空前一个并跳转
         newArray[index - 1] = '';
         codeArray.value = newArray;
         inputRefs.value[index - 1]?.focus();
      }
   } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputRefs.value[index - 1]?.focus();
   } else if (event.key === 'ArrowRight' && index < length.value - 1) {
      event.preventDefault();
      inputRefs.value[index + 1]?.focus();
   }
};

// 处理粘贴
const handlePaste = (event: ClipboardEvent) => {
   event.preventDefault();
   const pastedData = event.clipboardData?.getData('text') || '';
   const numericData = pastedData.replace(/[^0-9]/g, '').slice(0, length.value);

   if (numericData) {
      const newArray = numericData.split('');
      // 填充剩余位置为空
      while (newArray.length < length.value) {
         newArray.push('');
      }
      codeArray.value = newArray;

      // 聚焦到最后一个填充的位置或最后一个框
      const focusIndex = Math.min(numericData.length, length.value - 1);
      inputRefs.value[focusIndex]?.focus();

      // 检查是否完成
      if (numericData.length === length.value) {
         emit('complete', code.value);
      }
   }
};

// 设置输入框引用
const setInputRef = (el: any, index: number) => {
   if (el) {
      inputRefs.value[index] = el;
   }
};

// 聚焦到第一个空输入框
const focusFirstEmpty = () => {
   const firstEmptyIndex = codeArray.value.findIndex((digit) => !digit);
   const targetIndex =
      firstEmptyIndex === -1 ? length.value - 1 : firstEmptyIndex;
   inputRefs.value[targetIndex]?.focus();
};

// 清空所有输入
const clear = () => {
   code.value = '';
   inputRefs.value[0]?.focus();
};

onMounted(() => {
   setTimeout(() => {
      focusFirstEmpty();
   }, 300);
});

defineExpose({
   clear,
   focusFirstEmpty,
});
</script>

<template>
   <div
      class="p-4 rounded-xl border flex-col border-accent-500 w-fit bg-accent-600 text-white flex gap-3">
      <div class="flex flex-col gap-2">
         <div class="flex items-center gap-2">
            <Protect size="1rem" :strokeWidth="3" />
            <div class="st-font-body-bold !text-sm">验证您的邮箱</div>
         </div>
      </div>

      <div class="text-sm w-[16rem] text-accent-200 mb-1">
         我们已向您的邮箱发送了一封包含验证码的邮件。请输入验证码以继续。
      </div>

      <StSpace gap="0.75rem" justify="center">
         <input
            v-for="(digit, index) in codeArray"
            :key="index"
            :ref="(el) => setInputRef(el, index)"
            type="text"
            inputmode="numeric"
            maxlength="1"
            :value="digit"
            @input="(e) => handleInput(index, e)"
            @keydown="(e) => handleKeydown(index, e)"
            @paste="handlePaste"
            class="w-12 h-14 text-center text-xl font-bold bg-accent-700 border-2 border-accent-500 rounded-lg text-white outline-none transition-all caret-primary selection:bg-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/30 hover:border-accent-400 font-family-manrope" />
      </StSpace>
      <div v-if="error" class="text-error text-xs st-shaking">
         验证码错误，请重试。
      </div>
   </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
   -webkit-appearance: none;
   margin: 0;
}
</style>
