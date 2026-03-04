<template>
   <aside
      class="h-full flex flex-col items-center py-2 px-2 shrink-0 bg-[#1F1F1F] rounded-xl z-[1000]">
      <slot name="header">
         <StSpace
            align="center"
            justify="center"
            class="size-[2.75rem] bg-[#272727] rounded-lg">
            <IconLogo class="scale-[0.6] origin-center" />
         </StSpace>
      </slot>
      <slot></slot>
   </aside>
</template>
