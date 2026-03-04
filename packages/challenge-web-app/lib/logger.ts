import pino from 'pino';

declare const window: any;

const _logger = pino({
   transport: {
      target: 'pino-pretty',
      options: {
         colorize: true,
         translateTime: 'SYS:standard',
         ignore: 'pid,hostname',
      },
   },
});

export const logger = (() => {
   return _logger;
})();
