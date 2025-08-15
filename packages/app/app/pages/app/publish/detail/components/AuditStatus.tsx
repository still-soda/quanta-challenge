import { StSpace } from '#components';
import { CheckOne, CloseOne, LoadingFour } from '@icon-park/vue-next';

export const AuditFail = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-error'>
         <CloseOne />
         审核失败
      </StSpace>
   );
};

export const AuditSuccess = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-success'>
         <CheckOne />
         审核成功
      </StSpace>
   );
};

export const AuditPending = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-warning'>
         <LoadingFour class='animate-spin' />
         审核中
      </StSpace>
   );
};
