import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';

export async function generateThumbhashFromBuffer(buffer: Buffer) {
   const { data, info } = await sharp(buffer)
      .resize(100, 100, { fit: 'inside' })
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });
   const hash = rgbaToThumbHash(info.width, info.height, data);
   return Buffer.from(hash).toString('base64');
}
