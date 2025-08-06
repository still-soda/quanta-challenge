import { StIcon, StSpace } from '#components';

export const AuditFail = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-error'>
         <StIcon name='CloseOne' />
         审核失败
      </StSpace>
   );
};

export const AuditSuccess = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-success'>
         <StIcon name='CheckOne' />
         审核成功
      </StSpace>
   );
};

export const AuditPending = () => {
   return (
      <StSpace align='center' gap='0.375rem' class='text-warning'>
         <StIcon name='LoadingFour' class='animate-spin' />
         审核中
      </StSpace>
   );
};
