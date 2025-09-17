import { StSpace } from '#components';
import { Forbid, Lock, Unlock } from '@icon-park/vue-next';

export const NotPassed = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-accent-300'>
         <Forbid />
         未通过审核
      </StSpace>
   );
};

export const Published = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-success'>
         <Unlock />
         已发布
      </StSpace>
   );
};

export const Unpublished = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-primary'>
         <Lock />
         未发布
      </StSpace>
   );
};
