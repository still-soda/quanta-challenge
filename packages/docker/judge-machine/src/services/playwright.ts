import { Singleton } from '../utils/singleton.js';
import {
   chromium,
   type Browser,
   type BrowserContext,
   type Page,
} from 'playwright';

export class PlaywrightService extends Singleton {
   static get instance() {
      return this.getInstance<PlaywrightService>();
   }

   private constructor(
      public instanceCount: number = 1,
      private browsers: Browser[] = new Array(instanceCount).fill(null)
   ) {
      super();
   }

   async init(instanceCount: number = 1) {
      if (instanceCount < 1) {
         throw new Error('Instance count must be at least 1');
      }
      this.instanceCount = instanceCount;
      this.browsers = await Promise.all(
         Array.from({ length: instanceCount }, () =>
            chromium.launch({ headless: true })
         )
      );
   }

   private async pickAliveBrowser() {
      if (this.browsers.length === 0) {
         this.browsers.push(await chromium.launch({ headless: true }));
      }
      const ensureBrowserPoolHealth = async () => {
         for (let i = 0; i < this.browsers.length; i++) {
            if (!this.browsers[i]) {
               this.browsers[i] = await chromium.launch({ headless: true });
            }
         }
      };
      ensureBrowserPoolHealth();
      return this.browsers[0];
   }

   private async checkUrlAccessible(url: string) {
      return await fetch(url)
         .then(() => true)
         .catch(() => false);
   }

   private sanitizeUrl(input: string): string {
      return input
         .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '')
         .replace(/[\u0000-\u001F\u007F]/g, '')
         .trim();
   }

   async openPage(
      url: string,
      maxRetries: number = 3
   ): Promise<{
      context: BrowserContext;
      page: Page;
      close: () => Promise<void>;
   }> {
      url = this.sanitizeUrl(url);
      if (!(await this.checkUrlAccessible(url))) {
         throw new Error(`URL is not accessible: ${url}`);
      }

      try {
         const browser = await this.pickAliveBrowser();
         const context = await browser.newContext();
         const page = await context.newPage();
         await page.goto(url);
         return {
            context,
            page,
            close: async () => {
               await page.close();
               await context.close();
            },
         };
      } catch (error) {
         console.error(`Error occurred while opening page: ${error}`);
         if (maxRetries <= 0) {
            throw new Error(`Failed to open page after retries: ${url}`);
         }
         if (!(await this.healthCheck(0))) {
            this.browsers.shift();
         }
         return await this.openPage(url, maxRetries - 1);
      }
   }

   async healthCheck(browserIndex: number = 0): Promise<boolean> {
      if (browserIndex < 0 || browserIndex >= this.browsers.length) {
         console.error(`Invalid browser index: ${browserIndex}`);
         return false;
      }
      const browser = this.browsers[browserIndex];

      try {
         const context = await browser.newContext();
         const page = await context.newPage();
         await page.close();
         await context.close();
         return true;
      } catch (error) {
         console.error('Health check failed:', error);
         return false;
      }
   }

   async restart(browserIndex: number = 0) {
      if (browserIndex < 0 || browserIndex >= this.browsers.length) {
         console.error(`Invalid browser index: ${browserIndex}`);
         return false;
      }

      try {
         const browser = this.browsers[browserIndex];
         await browser.close();
         this.browsers[browserIndex] = await chromium.launch({
            headless: true,
         });
         console.log('Playwright browser restarted successfully.');
         return true;
      } catch (error) {
         console.error('Failed to restart Playwright browser:', error);
         return false;
      }
   }

   async destroy() {
      await Promise.all(
         this.browsers.map(async (browser) => {
            try {
               await browser.close();
            } catch (error) {
               console.error('Error closing browser:', error);
            }
         })
      );
      this.browsers = [];
   }
}
