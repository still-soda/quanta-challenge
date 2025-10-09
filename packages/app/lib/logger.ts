import winston from 'winston';

declare const window: any;

export const logger = (() => {
   if (typeof window === 'undefined') {
      const format =
         import.meta.env.NODE_ENV === 'development'
            ? winston.format.combine(
                 winston.format.colorize(),
                 winston.format.simple()
              )
            : winston.format.json();

      return winston.createLogger({
         level: 'info',
         format: winston.format.json(),
         defaultMeta: { service: 'user-service' },
         transports: [new winston.transports.Console({ format })],
      });
   } else {
      return console;
   }
})();
