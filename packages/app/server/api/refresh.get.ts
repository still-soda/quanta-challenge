export default defineEventHandler(async (event) => {
   const refreshToken = getHeader(event, 'refreshToken');
   if (!refreshToken) {
      setResponseStatus(event, 401);
      return { error: 'Unauthorized' };
   }

   try {
      const tokens = renewTokens(refreshToken);
      setResponseStatus(event, 200);
      return tokens;
   } catch (error: any) {
      setResponseStatus(event, 401);
      return { error: 'Invalid refresh token' };
   }
});
