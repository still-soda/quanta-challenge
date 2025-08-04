import { Hono } from 'hono';
import { createNodeWebSocket } from '@hono/node-ws';
import { EventEmitterService } from '../services/event-emitter.js';
import { EventType, type EventMessage } from '../events/index.js';

const app = new Hono();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.get(
   '/link',
   upgradeWebSocket((c) => {
      return {
         onMessage({ data }, ws) {
            if (data === 'ping') {
               return;
            }
            EventEmitterService.instance.emit<[EventMessage['MESSAGE']]>(
               EventType.MESSAGE,
               { data, ws }
            );
         },
         onClose(evt, ws) {
            EventEmitterService.instance.emit<[EventMessage['CLOSE']]>(
               EventType.CLOSE,
               { data: evt, ws }
            );
         },
         onError(evt, ws) {
            EventEmitterService.instance.emit<[EventMessage['ERROR']]>(
               EventType.ERROR,
               { event: evt, ws }
            );
         },
         onOpen(evt, ws) {
            EventEmitterService.instance.emit<[EventMessage['OPEN']]>(
               EventType.OPEN,
               {
                  event: evt,
                  data: { url: c.req.url },
                  ws,
               }
            );
         },
      };
   })
);

export { app, injectWebSocket };
