import { StIcon, StSpace } from '#components';

export const NotPassed = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-accent-300'>
         <StIcon name='Forbid' />
         未通过审核
      </StSpace>
   );
};

export const Published = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-success'>
         <StIcon name='Unlock' />
         已发布
      </StSpace>
   );
};

export const Unpublished = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-primary'>
         <StIcon name='Lock' />
         未发布
      </StSpace>
   );
};
