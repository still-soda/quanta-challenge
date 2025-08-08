import type { IStore } from './i-store';
import { LocalStore } from './local-store';

const store = new LocalStore();

export const useStore = (): IStore => {
   return store;
};
