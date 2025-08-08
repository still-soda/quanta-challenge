import * as Comlink from 'comlink';
import { thumbHashToRGBA } from 'thumbhash';

export class ThumbHashWorker {
   canvas = new OffscreenCanvas(0, 0);
   ctx = this.canvas.getContext('2d');

   constructor() {}

   async convertToImageUrl(hash: string) {
      const buffer = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));
      const { rgba, w, h } = thumbHashToRGBA(buffer);

      const imageUrl = await new Promise<string>((resolve) => {
         this.canvas.width = w;
         this.canvas.height = h;
         if (this.ctx) {
            const imageData = new ImageData(new Uint8ClampedArray(rgba), w, h);
            this.ctx.putImageData(imageData, 0, 0);
            this.canvas
               .convertToBlob()
               .then((blob) => URL.createObjectURL(blob))
               .then((url) => resolve(url));
         } else {
            resolve('');
         }
      });

      return {
         imageUrl: imageUrl,
         width: w,
         height: h,
      };
   }
}

const instance = new ThumbHashWorker();
Comlink.expose(instance);
