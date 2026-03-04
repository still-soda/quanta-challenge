<script setup lang="ts">
const props = defineProps<{
   speed?: 'slow' | 'default' | 'fast';
}>();

const rippleRef = useTemplateRef('ripple');
const containerRef = useTemplateRef('container');
const onWrapperClick = (e: MouseEvent) => {
   const x = e.clientX - containerRef.value!.getBoundingClientRect().left;
   const y = e.clientY - containerRef.value!.getBoundingClientRect().top;
   rippleRef.value?.getAnimations().forEach((animation) => animation.cancel());
   rippleRef.value?.animate(
      [
         {
            clipPath: `circle(0% at ${x}px ${y}px)`,
            opacity: 0.4,
         },
         {
            clipPath: `circle(200% at ${x}px ${y}px)`,
            opacity: 0,
         },
      ],
      {
         duration:
            props.speed === 'slow' ? 800 : props.speed === 'fast' ? 400 : 600,
         easing: 'ease-out',
      },
   );
};
</script>

<template>
   <div ref="container" class="relative" @click="onWrapperClick">
      <slot />
      <div
         @click.stop
         ref="ripple"
         class="absolute left-0 top-0 pointer-events-none opacity-0 invert-100">
         <slot />
      </div>
   </div>
</template>
