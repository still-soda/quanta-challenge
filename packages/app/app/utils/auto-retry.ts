export function autoRetry<T>(
   fn: () => Promise<T>,
   retries = 3,
   delay = 500
): Promise<T> {
   return new Promise((resolve, reject) => {
      const attempt = (n: number) => {
         fn()
            .then(resolve)
            .catch((err) => {
               if (n > 0) {
                  setTimeout(() => attempt(n - 1), delay);
               } else {
                  reject(err);
               }
            });
      };
      attempt(retries);
   });
}
