<script setup lang="ts">
defineProps<{
   glitchText: string;
}>();
</script>

<template>
   <div class="wrapper" :style="`--glitch-text: '${glitchText}'`">
      <h1 class="glitch">{{ glitchText }}</h1>
   </div>
</template>

<style lang="css" scoped>
.wrapper {
   display: flex;
   justify-content: center;
   align-items: center;
}
.wrapper h1.glitch {
   color: white;
   font-family: 'Manrope', sans-serif;
   line-height: 100%;
   font-weight: 800;
   position: relative;
   font-size: 152px;
}
.wrapper h1.glitch::before,
.wrapper h1.glitch::after {
   color: white;
   content: var(--glitch-text);
   position: absolute;
   width: 100%;
   height: 100%;
   background: #111;
   overflow: hidden;
   top: 0;
}
.wrapper h1.glitch::before {
   left: 4px;
   text-shadow: -4px 0 #fa7c0e;
   animation-name: glitch-animation-1;
   animation-duration: 1s;
   animation-timing-function: step(5, end);
   animation-delay: 0s;
   animation-iteration-count: infinite;
   animation-direction: reverse-alternate;
}
.wrapper h1.glitch::after {
   left: -4px;
   text-shadow: -4px 0 blue;
   animation-name: glitch-animation-2;
   animation-duration: 1.5s;
   animation-timing-function: step(5, end);
   animation-delay: 0s;
   animation-iteration-count: infinite;
   animation-direction: reverse-alternate;
}
@keyframes glitch-animation-1 {
   0% {
      clip: rect(38px, 350px, 182px, 0px);
   }
   5% {
      clip: rect(158px, 350px, 117px, 0px);
   }
   10% {
      clip: rect(18px, 350px, 107px, 0px);
   }
   15% {
      clip: rect(142px, 350px, 206px, 0px);
   }
   20% {
      clip: rect(106px, 350px, 157px, 0px);
   }
   25% {
      clip: rect(84px, 350px, 147px, 0px);
   }
   30% {
      clip: rect(30px, 350px, 43px, 0px);
   }
   35% {
      clip: rect(192px, 350px, 13px, 0px);
   }
   40% {
      clip: rect(58px, 350px, 20px, 0px);
   }
   45% {
      clip: rect(43px, 350px, 180px, 0px);
   }
   50% {
      clip: rect(168px, 350px, 1px, 0px);
   }
   55% {
      clip: rect(115px, 350px, 205px, 0px);
   }
   60% {
      clip: rect(159px, 350px, 199px, 0px);
   }
   65% {
      clip: rect(99px, 350px, 24px, 0px);
   }
   70% {
      clip: rect(87px, 350px, 93px, 0px);
   }
   75% {
      clip: rect(92px, 350px, 70px, 0px);
   }
   80% {
      clip: rect(145px, 350px, 156px, 0px);
   }
   85% {
      clip: rect(59px, 350px, 154px, 0px);
   }
   90% {
      clip: rect(100px, 350px, 144px, 0px);
   }
   95% {
      clip: rect(192px, 350px, 8px, 0px);
   }
   100% {
      clip: rect(2px, 350px, 11px, 0px);
   }
}

@keyframes glitch-animation-2 {
   0% {
      clip: rect(204px, 350px, 134px, 0px);
   }
   5% {
      clip: rect(117px, 350px, 149px, 0px);
   }
   10% {
      clip: rect(145px, 350px, 182px, 0px);
   }
   15% {
      clip: rect(68px, 350px, 112px, 0px);
   }
   20% {
      clip: rect(95px, 350px, 134px, 0px);
   }
   25% {
      clip: rect(180px, 350px, 110px, 0px);
   }
   30% {
      clip: rect(2px, 350px, 92px, 0px);
   }
   35% {
      clip: rect(98px, 350px, 118px, 0px);
   }
   40% {
      clip: rect(95px, 350px, 66px, 0px);
   }
   45% {
      clip: rect(84px, 350px, 39px, 0px);
   }
   50% {
      clip: rect(7px, 350px, 199px, 0px);
   }
   55% {
      clip: rect(163px, 350px, 38px, 0px);
   }
   60% {
      clip: rect(119px, 350px, 105px, 0px);
   }
   65% {
      clip: rect(208px, 350px, 3px, 0px);
   }
   70% {
      clip: rect(98px, 350px, 86px, 0px);
   }
   75% {
      clip: rect(70px, 350px, 204px, 0px);
   }
   80% {
      clip: rect(185px, 350px, 145px, 0px);
   }
   85% {
      clip: rect(121px, 350px, 163px, 0px);
   }
   90% {
      clip: rect(118px, 350px, 201px, 0px);
   }
   95% {
      clip: rect(115px, 350px, 158px, 0px);
   }
   100% {
      clip: rect(202px, 350px, 57px, 0px);
   }
}
</style>
