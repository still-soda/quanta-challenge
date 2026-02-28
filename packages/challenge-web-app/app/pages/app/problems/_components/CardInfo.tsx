import { $Enums } from '@prisma/client';

export const PassRate = ({ rate }: { rate: number }) => {
   const passRate = rate.toFixed(2);
   return (
      <div class='font-bold font-family-manrope leading-[90%]'>{passRate}%</div>
   );
};

export const Score = ({ score }: { score: number }) => {
   return (
      <div class='font-bold font-family-manrope leading-[90%]'>
         {score.toFixed(0)}
      </div>
   );
};

export const Difficulty = ({
   difficulty,
}: {
   difficulty: $Enums.Difficulty;
}) => {
   const difficultyMap: Record<$Enums.Difficulty, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      very_hard: '非常困难',
   };
   const colorClass: Record<$Enums.Difficulty, string> = {
      easy: 'text-secondary',
      medium: 'text-warning',
      hard: 'text-primary',
      very_hard: 'text-error',
   };
   return (
      <div
         class={[
            'font-bold font-family-manrope leading-[90%] ',
            colorClass[difficulty],
         ]}>
         {difficultyMap[difficulty]}
      </div>
   );
};
