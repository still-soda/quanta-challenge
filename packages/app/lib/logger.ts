import winston from 'winston';

declare const window: any;

export const logger = (() => {
   // if (typeof window === 'undefined') {
   //    try {
   //       // 确保 winston 和 winston.format 已正确加载
   //       if (!winston || !winston.format) {
   //          console.warn(
   //             'Winston not properly initialized, falling back to console'
   //          );
   //          return console;
   //       }

   //       const format =
   //          import.meta.env.NODE_ENV === 'development'
   //             ? winston.format.combine(
   //                  winston.format.colorize(),
   //                  winston.format.simple()
   //               )
   //             : winston.format.json();

   //       return winston.createLogger({
   //          level: 'info',
   //          format: winston.format.json(),
   //          defaultMeta: { service: 'user-service' },
   //          transports: [new winston.transports.Console({ format })],
   //       });
   //    } catch (error) {
   //       console.error('Failed to initialize winston logger:', error);
   //       return console;
   //    }
   // } else {
   //    return console;
   // }
   return console;
})();
